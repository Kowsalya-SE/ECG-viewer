require("dotenv").config();
const express = require('express');
const fs = require('fs');
const http = require("http");
const cors = require("cors");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const { google } = require("googleapis");
const mongoose = require('mongoose')

const app = express();
const server = http.createServer(app);

const port = process.env.API_PORT || 3309;  // Set default port

// Google OAuth Credentials (from .env file)
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error("⚠️  Missing Google OAuth credentials in .env");
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

// Rate limiter (optional)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
});
app.use(limiter);

// 🔹 Step 1: Redirect to Google OAuth
app.get("/auth/google", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
  });
  res.redirect(authUrl);
});

// 🔹 Step 2: Handle Google OAuth Callback
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Authorization code not found");

  try {
    // Get access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    console.log("Google User Info:", googleUser);

    // Check if user exists in your DB
    const userCollection = mongoose.connection.collection('users'); // Access 'users' collection
    const user = await userCollection.findOne({ email: googleUser.email }); // Query the document

    if (!user) {
      // If not, create a new user
      await userconnection.insertOne({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        profilePicture: googleUser.picture,

      });
    }

    // Generate a JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.json({ token, user });
  } catch (error) {
    console.error("Error retrieving user info", error);
    res.status(500).send("Authentication failed");
  }
});

// 🔹 Load Routes from `./routes` (if exists)
const routeDir = "./routes";
if (fs.existsSync(routeDir)) {
    const routeFiles = fs.readdirSync(routeDir);
    routeFiles.forEach(file => {
        app.use(`/api/v1/`, require(`./routes/${file}`));
    });
} else {
    console.warn("⚠️  Warning: No routes directory found.");
}

// 🔹 Handle 404 Errors
app.use("*", (req, res) => {
  res.status(404).json({
      message: "Page not found",
      code: "404",
      status: "failure"
  });
});

// 🔹 Start Server (Ensure it binds to 0.0.0.0 for Codespaces)
server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running at:`);
    console.log(`👉 https://cuddly-waffle-q77g9wp5gqgjf465p-3309.app.github.dev`);
});

const MONGO_URI = `mongodb://${process.env.DB_HOST_SECOND}:${process.env.DB_PORT_SECOND}/${process.env.DB_DATABASE_SECOND}`;
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('MongoDB connected successfully');
  }).catch((error) => {
    console.error('Stack trace:', error.stack);  
    console.error('MongoDB connection error:', error);
  });