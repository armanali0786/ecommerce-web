import { ShoppingBag, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { useState, useEffect } from "react";

export function Footer() {
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [googleDriveFiles, setGoogleDriveFiles] = useState([]);

  // Load top-level folders/files when modal opens
  useEffect(() => {
    if (showDriveModal) {
      fetch("https://ecommerce-web-4pmx.onrender.com/api/google-drive-folders")
        .then((res) => res.json())
        .then((data) => setGoogleDriveFiles(data.folders || []))
        .catch((err) => console.error(err));
    }
  }, [showDriveModal]);

  // Fetch files inside folder
  const fetchFilesInsideFolder = async (folderId) => {
    try {
      const res = await fetch(`https://ecommerce-web-4pmx.onrender.com/api/google-drive/folder/${folderId}`);
      const data = await res.json();
      return data.files || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Recursive Drive Tree
  const DriveTree = ({ items }) => {
    const [openState, setOpenState] = useState({});

    const toggleFolder = async (item) => {
      if (item.mimeType !== "application/vnd.google-apps.folder") return;

      const isOpen = openState[item.id];
      if (isOpen) {
        setOpenState((prev) => ({ ...prev, [item.id]: null }));
        return;
      }

      const children = await fetchFilesInsideFolder(item.id);
      setOpenState((prev) => ({ ...prev, [item.id]: children }));
    };

    return (
      <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
        {items.map((item) => {
          const isFolder = item.mimeType === "application/vnd.google-apps.folder";
          const children = openState[item.id];

          // Icon based on file type
          let icon;
          if (isFolder) icon = children ? "📂" : "📁";
          else if (item.mimeType.startsWith("image/")) icon = "🖼️";
          else if (item.mimeType.startsWith("video/")) icon = "🎬";
          else if (item.mimeType === "application/pdf") icon = "📄";
          else icon = "📄";

          return (
            <li key={item.id} style={{ marginBottom: "8px" }}>
              <div
                onClick={() => toggleFolder(item)}
                style={{
                  cursor: isFolder ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <strong>{icon}</strong>
                <span>{item.name}</span>

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
              </div>

              {children && <DriveTree items={children} />}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Footer Grid */}
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

      {/* Google Drive Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] md:w-[600px] max-h-[80vh] overflow-auto p-6 rounded-lg relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Google Drive Files</h2>
              <button
                onClick={() => setShowDriveModal(false)}
                className="text-red-500 text-xl"
              >
                ✖
              </button>
            </div>

            {googleDriveFiles.length > 0 ? (
              <DriveTree items={googleDriveFiles} />
            ) : (
              <p className="text-gray-600">No files found.</p>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
