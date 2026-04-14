const express = require("express");
const http = require("http");
const socketConfig = require("./socket"); // ← import socket

const app = express();
const server = http.createServer(app);

app.use(express.json());

// Khởi tạo socket
socketConfig(server);

server.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});

module.exports = { app, server };
