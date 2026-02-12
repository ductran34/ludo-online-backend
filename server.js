const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

let rooms = {}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId)

    if (!rooms[roomId]) {
      rooms[roomId] = []
    }

    if (rooms[roomId].length < 4) {
      rooms[roomId].push(socket.id)
      io.to(roomId).emit("updatePlayers", rooms[roomId])
    }
  })

  socket.on("rollDice", (roomId) => {
    const dice = Math.floor(Math.random() * 6) + 1
    io.to(roomId).emit("diceResult", dice)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id)
      io.to(roomId).emit("updatePlayers", rooms[roomId])
    }
  })
})

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})