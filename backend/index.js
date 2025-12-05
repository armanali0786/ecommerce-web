const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

// Initialize Express app
const app = express();
const port = 5000;

// MongoDB URL
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.zxbyl9m.mongodb.net/ecommerce?retryWrites=true&w=majority";

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Middleware to parse JSON
app.use(bodyParser.json());

// CORS Configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ----------------------------
// Mongoose Schema
// ----------------------------
const fileSchema = new mongoose.Schema({
  id: String,         // Google Drive file ID
  name: String,       // File / Folder name
  mimeType: String,   // Type (folder or file)
  kind: String,       // drive#file
  parents: [String],  // List of parent folder IDs
});

const File = mongoose.model("File", fileSchema);

// ----------------------------
// POST API - Store Google Drive files
// ----------------------------
app.post("/api/store-google-drive-files", async (req, res) => {
  try {
    const files = req.body.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files provided" });
    }

    // Insert into database
    const savedFiles = await File.insertMany(files);

    return res.status(200).json({ success: true, files: savedFiles });
  } catch (error) {
    console.error("Error storing files:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});
// ----------------------------
// GET ALL files & folders
// ----------------------------
app.get("/api/google-drive-files", async (req, res) => {
  try {
    const allFiles = await File.find();
    return res.status(200).json({ success: true, files: allFiles });
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ----------------------------
// GET ONLY Folders
// ----------------------------
app.get("/api/google-drive-folders", async (req, res) => {
  try {
    const folders = await File.find({
      mimeType: "application/vnd.google-apps.folder",
    });
    return res.status(200).json({ success: true, folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ----------------------------
// GET FILES INSIDE SPECIFIC FOLDER
// ----------------------------
app.get("/api/google-drive/folder/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;

    const filesInsideFolder = await File.find({
      parents: folderId,
    });

    return res.status(200).json({
      success: true,
      files: filesInsideFolder,
    });
  } catch (error) {
    console.error("Error fetching folder contents:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { code, verifier } = req.body;

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }
    );
    console.log("res only ",tokenRes);
    console.log("res data this ",tokenRes.data);
    return res.json(tokenRes.data); // send tokens (access + refresh)
  } catch (error) {
    console.error("OAuth error:", error.response?.data || error);
    res.status(500).json({ error: "Google OAuth failed" });
  }
});

app.get("/api/google-drive/files", async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    const response = await axios.get(
      "https://www.googleapis.com/drive/v3/files?fields=*",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    res.json(response.data.files);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files from Google Drive" });
  }
});


// ----------------------------
// Start Server
// ----------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
