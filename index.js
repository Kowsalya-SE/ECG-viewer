require("dotenv").config();
const express = require('express');
const fs = require('fs');
const http = require("http");
const cors = require("cors");
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const server = http.createServer(app);

const port = process.env.API_PORT || 3309;  // Set default port
// Middleware
app.use(express.json({limit:"500mb"}));
app.use(express.urlencoded({extended:true, limit:'500mb'}))
app.use(bodyParser.json({limit:'500mb'}));
app.use(bodyParser.urlencoded({extended:'true',limit:'500mb'}))
app.use(morgan('dev'));
app.use(cors());
app.use('/api/v1/storage', express.static('storage'));


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

app.use((req,res,next)=> {
    console.log(`Request size:${req.headers['content-length']} bytes`);
    next();
})
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
    console.log(`🚀 Server running at:${port}`);
});
