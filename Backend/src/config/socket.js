const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on("new_booking", (data) => {
      io.to(data.driverId).emit("incoming_booking", data);
    });

    socket.on("driver_accepted", (data) => {
      io.to(data.customerId).emit("booking_confirmed", data);
    });

    socket.on("driver_location", (data) => {
      io.to(data.customerId).emit("driver_location", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });

  return io;
};
