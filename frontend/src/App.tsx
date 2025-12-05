import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryCard } from './components/CategoryCard';
import { ProductCard } from './components/ProductCard';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { Filter } from 'lucide-react';
import Modal from './components/ui/modal'; // You can create a simple Modal component for the popup

const CLIENT_ID = '681524091920-8qns4l8hj6q9fuuqrchlnbopq0p66ppc.apps.googleusercontent.com';
interface User {
  email: string;
}

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state
  const [googleDriveFiles, setGoogleDriveFiles] = useState([]); // To store files from Google Drive
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if the user is authenticated
  const [modalInterval, setModalInterval] = useState(null); // Store interval ID
  const [driveFiles, setDriveFiles] = useState([])
  const [photo, setPhotos] = useState([]);
  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  async function generatePkce() {
    const encoder = new TextEncoder();
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);

    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return { codeVerifier, codeChallenge };
  }


  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("video/")) return "🎬";
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType.includes("spreadsheet")) return "📊";
    if (mimeType.includes("document")) return "📝";
    if (mimeType.includes("folder")) return "📁";
    if (mimeType === "application/zip") return "🗜️";
    if (mimeType.includes("presentation")) return "📽️";
    return "📦"; // default
  };

  const handleGoogleLogin = async () => {
    const { codeVerifier, codeChallenge } = await generatePkce();

    localStorage.setItem("pkce_verifier", codeVerifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: "https://femme-style.netlify.app/auth/callback",
      response_type: "code",
      scope: "openid profile email https://www.googleapis.com/auth/drive.readonly",
      access_type: "offline",
      prompt: "consent",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google OAuth script loaded");
    };

    document.body.appendChild(script);
  }, []);

  const fetchGoogleDriveFiles = async (accessToken) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = await response.json();

      if (data?.files) {
        setGoogleDriveFiles(data.files);
        localStorage.setItem("google_drive_files", JSON.stringify(data.files));
        sendFilesToBackend(accessToken, data.files);
        closeModal();
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchFilesInsideFolder = async (accessToken, folderId) => {
    console.log("Fetching files inside folder ID:", folderId);
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = await response.json();
      // setIsModalOpen(false);
      closeModal();
      console.log("Folder content:", data.files);
      return data.files;
    } catch (error) {
      console.error("Error fetching folder files:", error);
    }
  };

  const formatGoogleDriveFiles = (googleDriveFiles, accessTokenData) => {
    return googleDriveFiles.map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      kind: file.kind,
      accessTokenData: accessTokenData
    }));
  };

  const sendFilesToBackend = async (accessTokenData, googleDriveFiles) => {
    try {
      const formattedFiles = formatGoogleDriveFiles(googleDriveFiles, accessTokenData);

      // Send to backend API
      const response = await fetch("https://ecommerce-web-4pmx.onrender.com/api/store-google-drive-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessTokenData}`,
        },
        body: JSON.stringify({
          files: formattedFiles,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Files successfully saved to backend:", data);
      } else {
        console.error("Error saving files to backend:", data);
      }
    } catch (error) {
      console.error("Error sending files to backend:", error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const verifier = localStorage.getItem("pkce_verifier");

    if (code && verifier) {
      fetch("https://ecommerce-web-4pmx.onrender.com/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, verifier }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          localStorage.setItem("google_access_token", data.access_token);

          // Fetch files
          await fetchGoogleDriveFiles(data.access_token);
        });
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated && googleDriveFiles.length === 0) {
      const intervalId = setInterval(() => {
        setIsModalOpen(true);
      }, 5000);

      setModalInterval(intervalId);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, googleDriveFiles]);

  const handleLogout = () => {
    setUser(null);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  }

  const categories = [
    {
      id: 1,
      name: 'Clothing',
      image: 'https://images.unsplash.com/photo-1762154057377-cc9d3dd6900c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGZhc2hpb24lMjBkcmVzc3xlbnwxfHx8fDE3NjQ2Mzc0Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      count: 150,
    },
    {
      id: 2,
      name: 'Shoes & Heels',
      image: 'https://images.unsplash.com/photo-1621996659490-3275b4d0d951?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNob2VzJTIwaGVlbHN8ZW58MXx8fHwxNzY0NTc2MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      count: 80,
    },
    {
      id: 3,
      name: 'Sandals',
      image: 'https://images.unsplash.com/photo-1603290939650-b553549a5739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNhbmRhbHN8ZW58MXx8fHwxNzY0NjczNjkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      count: 60,
    },
    {
      id: 4,
      name: 'Jackets',
      image: 'https://images.unsplash.com/photo-1521510895919-46920266ddb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGphY2tldHxlbnwxfHx8fDE3NjQ2NzM2OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      count: 45,
    },
    {
      id: 5,
      name: 'Jewelry & Earrings',
      image: 'https://images.unsplash.com/photo-1617493255060-2745a8c22ebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwxfHx8fDE3NjQ2NzM2OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      count: 120,
    },
    {
      id: 6,
      name: 'Beauty & Makeup',
      image: 'https://images.unsplash.com/photo-1597225281099-88c45ee7fc2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBleWVsaW5lcnxlbnwxfHx8fDE3NjQ2NzM2OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      count: 95,
    },
  ];

  const products = [
    {
      id: 1,
      name: 'Elegant Summer Dress',
      price: 699,
      originalPrice: 879.99,
      image: 'https://images.unsplash.com/photo-1589212987511-4a924cb9d8ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZHJlc3N8ZW58MXx8fHwxNzY0NTczNzkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 5,
      category: 'Clothing',
    },
    {
      id: 2,
      name: 'Classic Heeled Shoes',
      price: 1229.99,
      image: 'https://images.unsplash.com/photo-1621996659490-3275b4d0d951?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNob2VzJTIwaGVlbHN8ZW58MXx8fHwxNzY0NTc2MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 5,
      category: 'Shoes',
    },
    {
      id: 3,
      name: 'Summer Sandals',
      price: 1299.99,
      originalPrice: 1079.99,
      image: 'https://images.unsplash.com/photo-1603290939650-b553549a5739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNhbmRhbHN8ZW58MXx8fHwxNzY0NjczNjkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4,
      category: 'Sandals',
    },
    {
      id: 4,
      name: 'Stylish Winter Jacket',
      price: 1599.99,
      originalPrice: 1249.99,
      image: 'https://images.unsplash.com/photo-1521510895919-46920266ddb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGphY2tldHxlbnwxfHx8fDE3NjQ2NzM2OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 5,
      category: 'Jackets',
    },
    {
      id: 5,
      name: 'Gold Hoop Earrings',
      price: 1439.99,
      image: 'https://images.unsplash.com/photo-1617493255060-2745a8c22ebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGVhcnJpbmdzJTIwamV3ZWxyeXxlbnwxfHx8fDE3NjQ2NzM2OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 5,
      category: 'Jewelry',
    },
    {
      id: 6,
      name: 'Premium Eyeliner Set',
      price: 1324.99,
      image: 'https://images.unsplash.com/photo-1597225281099-88c45ee7fc2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBleWVsaW5lcnxlbnwxfHx8fDE3NjQ2NzM2OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4,
      category: 'Beauty',
    },
    {
      id: 7,
      name: 'Floral Midi Dress',
      price: 1179.99,
      image: 'https://images.unsplash.com/photo-1762154057377-cc9d3dd6900c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGZhc2hpb24lMjBkcmVzc3xlbnwxfHx8fDE3NjQ2Mzc0Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 5,
      category: 'Clothing',
    },
    {
      id: 8,
      name: 'Casual Sneakers',
      price: 1289.99,
      originalPrice: 1119.99,
      image: 'https://images.unsplash.com/photo-1621996659490-3275b4d0d951?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNob2VzJTIwaGVlbHN8ZW58MXx8fHwxNzY0NTc2MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4,
      category: 'Shoes',
    },
  ];
  const handlePhotoLogin = () => {
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: [
        "openid",
        "profile",
        "email",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/photoslibrary.readonly"
      ].join(" "),
      ux_mode: "popup",
      redirect_uri: "http://localhost:3000/auth/callback",
      callback: (response) => {
        console.log("Authorization Code:", response.code);

        // Send code to backend to exchange for tokens
        fetch(`https://ecommerce-web-4pmx.onrender.com/auth/google/exchange-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: response.code }),
        })
          .then((res) => res.json())
          .then(async (data) => {
            console.log("Tokens:", data);

            const accessToken = data.access_token;
            localStorage.setItem("google_access_token", accessToken);

            setIsAuthenticated(true);
            loadDrive(accessToken);
            loadPhotos(accessToken);
          });
      }
    });

    client.requestCode();
  };

  const loadDrive = async (token) => {
    const res = await fetch("https://www.googleapis.com/drive/v3/files", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setDriveFiles(data.files || []);
  };

  const loadPhotos = async (token) => {
    const res = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPhotos(data.mediaItems || []);
  };

  console.log("phot", photo);
  console.log("Dtive", driveFiles)

  return (
    <>
      <div className="min-h-screen bg-white">
        <Navbar
          onLoginClick={() => setIsLoginModalOpen(true)}
          isLoggedIn={!!user}
          userEmail={user?.email}
          onLogout={handleLogout}
        />

        <Hero />

        {/* Categories Section */}
        <section className="py-16 bg-white" id="categories">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600">
                Explore our curated collections designed for every style
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  image={category.image}
                  count={category.count}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-gray-50" id="products">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div>
                <h2 className="text-gray-900 mb-2">Featured Products</h2>
                <p className="text-gray-600">Discover our latest collection</p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <select className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Best Rating</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <button className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition-colors">
                Load More Products
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white" id="about">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-900 mb-2">Free Shipping</h3>
                <p className="text-gray-600">On orders over 2500</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-900 mb-2">Quality Guarantee</h3>
                <p className="text-gray-600">Premium quality products</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-900 mb-2">Easy Returns</h3>
                <p className="text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg relative">

              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                ✕
              </button>

              <h2 className="text-2xl font-semibold text-center mb-2">
                Login to your account
              </h2>
              <p className="text-center text-gray-500 mb-6">
                You must be logged in to perform this action.
              </p>

              <button
                onClick={handleGoogleLogin}
                className="w-full border py-3 rounded-lg flex items-center justify-center space-x-2 mb-3 hover:bg-gray-50 cursor-pointer"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png"
                  alt="Google Icon"
                  className="w-10 h-5"
                />
                <span className="m-3">Continue with Google</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default App;
