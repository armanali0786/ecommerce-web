import { ShoppingBag, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { useState, useEffect } from "react";

export function Footer() {
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState([]);

  useEffect(() => {
    if (showDriveModal) {
      // Fetch the Google Drive files when the modal is opened
      fetch("https://ecommerce-web-4pmx.onrender.com/api/google-drive-files")
        .then((res) => {
          // Check if the response is ok (status 200)
          if (!res.ok) {
            throw new Error("Failed to fetch files");
          }
          return res.json();
        })
        .then((data) => {
          // Log data to inspect it (for debugging)
          console.log(data);

          // Set the googleDriveFiles state with the data if available
          setGoogleDriveFiles(data.files || []);
        })
        .catch((err) => {
          // Log error for debugging
          console.error("Error fetching Google Drive files:", err);
        });
    }
  }, [showDriveModal]); // Re-run this effect when showDriveModal changes


  // Recursive Drive Tree
  const DriveTree = ({ items }) => {
    const [openState, setOpenState] = useState({});

    // Function to toggle folders and fetch files inside them
    const toggleFolder = async (item) => {
      if (item.mimeType !== "application/vnd.google-apps.folder") return; // Only toggle for folders

      const isOpen = openState[item.id];

      if (isOpen) {
        // If folder is already open, close it by setting it to null
        setOpenState((prev) => ({ ...prev, [item.id]: null }));
        return;
      }

      // Fetch files inside the folder
      try {
        const children = await fetchFilesInsideFolder(item.id);
        setOpenState((prev) => ({ ...prev, [item.id]: children }));
      } catch (error) {
        console.error("Error fetching folder contents:", error);
      }
    };

    // Function to fetch files inside a folder
    const fetchFilesInsideFolder = async (folderId) => {
      try {
        const response = await fetch(`https://ecommerce-web-4pmx.onrender.com/api/google-drive/folder/${folderId}`);
        const data = await response.json();

        if (data.success) {
          return data.files;
        } else {
          throw new Error("Failed to fetch folder contents.");
        }
      } catch (error) {
        console.error("Error fetching folder contents:", error);
        return []; // Return empty array in case of an error
      }
    };
  const downloadFile = async (fileId, fileName) => {
    try {
      const accessToken = localStorage.getItem("google_access_token");

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

    return (
      <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
        {items.map((item) => {
          const isFolder = item.mimeType === "application/vnd.google-apps.folder";
          const children = openState[item.id];

          // Determine the icon based on mimeType
          let icon;
          if (isFolder) icon = children ? "📂" : "📁"; // Open or closed folder
          else if (item.mimeType.startsWith("image/")) icon = "🖼️";
          else if (item.mimeType.startsWith("video/")) icon = "🎬";
          else if (item.mimeType === "application/pdf") icon = "📄";
          else icon = "📄";

          return (
            <li key={item.id} style={{ marginBottom: "8px" }}>
              <div
                onClick={() => toggleFolder(item)} // Click folder to toggle open/close
                style={{
                  cursor: isFolder ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <strong>{icon}</strong>
                <span>{item.name}</span>

                {/* Show 'Open' link only for non-folders */}
                {!isFolder && (
                  <a
                    href={`https://drive.google.com/file/d/${item.id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-blue-600 font-semibold"
                  >
                    Open
                  </a>
                )}
                <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent folder toggle
                      downloadFile(item.id, item.name);
                    }}
                    style={{
                      marginLeft: "10px",
                      background: "#1e90ff",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Download
                  </button>
              </div>

              {/* Recursively render folder contents */}
              {children && <DriveTree items={children} />}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      {showDriveModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] md:w-[600px] max-h-[50vh] p-6 rounded-lg relative"
            style={{ overflowY: "auto" , maxHeight: "50vh" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Google Drive Files</h2>
              <button
                onClick={() => setShowDriveModal(false)}
                className="text-red-500 text-xl"
              >
                ✖
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {googleDriveFiles.length > 0 ? (
                <DriveTree items={googleDriveFiles} />
              ) : (
                <p className="text-gray-600">No files found.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-6 h-6 text-pink-400" />
                  <span className="text-pink-400">FemmeStyle</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Your destination for trendy fashion and beauty products.
                </p>
                <div className="flex gap-4">
                  <Facebook className="w-5 h-5 text-gray-400 hover:text-pink-400" />
                  <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-400" />
                  <Twitter className="w-5 h-5 text-gray-400 hover:text-pink-400" />
                  <Mail className="w-5 h-5 text-gray-400 hover:text-pink-400" />
                </div>
              </div>

              <div>
                <h3 className="text-white mb-4">Shop</h3>
                <ul className="space-y-2">
                  <li><a className="text-gray-400 hover:text-pink-400">Clothing</a></li>
                  <li><a className="text-gray-400 hover:text-pink-400">Shoes</a></li>
                  <li><a className="text-gray-400 hover:text-pink-400">Jackets</a></li>
                  <li><a className="text-gray-400 hover:text-pink-400">Jewelry</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white mb-4">Customer Service</h3>
                <ul className="space-y-2">
                  <li><a className="text-gray-400 hover:text-pink-400">Contact Us</a></li>
                  <li><a className="text-gray-400 hover:text-pink-400">Shipping Info</a></li>
                  <li><a className="text-gray-400 hover:text-pink-400">Returns</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white mb-4">Newsletter</h3>
                <p
                  className="text-gray-400 mb-4 cursor-pointer"
                  onClick={() => setShowDriveModal(true)}
                >
                  Subscribe to our newsletter for the latest updates!
                </p>
                <form className="space-y-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                  />
                  <button className="w-full bg-pink-600 py-2 rounded-lg">Subscribe</button>
                </form>
              </div>
            </div>

            <div className="text-center text-gray-400 mt-8">
              © 2025 FemmeStyle. All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </>
  );
}

