const express = require('express')
const app = express()
const path = require('path')

const { createServer } = require('http')
const httpServer = createServer(app)
const { Server } = require('socket.io')
const io = new Server(httpServer)

app.use(express.static(__dirname + '/public'))

const room = 'metaverse'
const PORT = 5000

io.on('connection', (socket) => {
    socket.join(room)
})

httpServer.listen(
    PORT,
    console.log(`Listening on port http://localhost:${PORT}`)
)
