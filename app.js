const express = require('express')
const app = express()
const path = require('path')

const { createServer } = require('http')
const httpServer = createServer(app)
const { Server } = require('socket.io')
const io = new Server(httpServer, { transports: ['websocket'] })

app.use(express.static(__dirname + '/public'))

const room = 'metaverse'
const PORT = 5000

io.on('connection', (socket) => {
    console.log(`User ${usersNumId.getNumId(socket.id)} connected`)
    socket.join(room)

    // Obj containing all the data of the user eg. position, shape, color, etc.
    let userData = {
        id: socket.id,
        position: { x: 0, y: 0, z: 0 },
    }

    // Place the users on the two ends of the room facing each other
    if (usersNumId.getNumId(socket.id) === 0) {
        console.log(`User ${usersNumId.getNumId(socket.id)} emitting`)
        userData.position = { x: 0, y: 2, z: 20 }
    } else {
        console.log(`User ${usersNumId.getNumId(socket.id)} emitting`)
        userData.position = { x: 0, y: 2, z: -20 }
    }

    // Add the user data to metaData obj and emit it
    metaData.addUserData(socket.id, userData)
    console.log(metaData.usersData)

    // Why JSON?
    // Read this: https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/5344074#5344074
    // Why replacer (defined below)?
    // Read this: https://stackoverflow.com/a/56150320/11342472
    socket.emit('init', JSON.stringify(metaData, replacer), socket.id)
    socket.broadcast.emit('new user', JSON.stringify(userData))

    socket.on('user movement update', (position) => {
        metaData.usersData.set(socket.id, { id: socket.id, position: position })
        const userData = metaData.getUserData(socket.id)
        io.emit('user movement update', JSON.stringify(userData))
    })

    // Remove the user data from metaData obj on disconnection
    socket.on('disconnecting', () => {
        console.log(`User ${usersNumId.getNumId(socket.id)} disconnected`)
        usersNumId.removeId(socket.id)
        metaData.removeUserData(socket.id)
    })
})

httpServer.listen(
    PORT,
    console.log(`Listening on port http://localhost:${PORT}`)
)

// @desc    object that contains mappings of socket.id to a numeric id
//          might remove it later on after a generic function for spawning of users will be written
const usersNumId = {
    numId: new Map(),
    list: [0, 0],
    getNumId: function (socketId) {
        if (this.numId.has(socketId) === false) {
            this.numId.set(socketId, this.getFirstEmptyId())
        }
        return this.numId.get(socketId)
    },
    removeId: function (socketId) {
        this.list[this.getNumId(socketId)] = 0
        this.numId.delete(socketId)
    },
    getFirstEmptyId: function () {
        // Assuming there will be only two users at a time (for now)
        if (this.list[0] === 0) {
            this.list[0] = 1
            return 0
        } else {
            this.list[1] = 1
            return 1
        }
    },
}

// @desc    logbook of all the information of metaverse world
const metaData = {
    usersData: new Map(),

    // maps socket.id to the user data such as position, shape, color, etc.
    addUserData: function (socketId, data) {
        this.usersData.set(socketId, data)
    },
    getUserData: function (socketId) {
        return this.usersData.get(socketId)
    },
    removeUserData: function (socketId) {
        this.usersData.delete(socketId)
    },
}

// @desc    required for serializing maps in JSON stringify
function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        }
    } else {
        return value
    }
}
