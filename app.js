const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Loading environment variables
dotenv.config({ path: "config.env" });

// Sessions
// How session, saveUnitialized and resave work?
// Read this: https://stackoverflow.com/questions/40381401/when-to-use-saveuninitialized-and-resave-in-express-session
app.use(
  session({
    secret: "SpongeVerse",
    resave: true,
    saveUninitialized: false,
  })
);

// Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

// To understand Passport serialize and deserialize,
// Read this: https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", require("./routes/route"));

// Creating Server
const { createServer } = require("http");
const httpServer = createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer, { transports: ["websocket"] });

app.use(express.static(__dirname + "/public"));

const room = "metaverse";
const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);
  socket.join(room);

  // Obj containing all the data of the user eg. position, shape, color, etc.
  let userData = {
    id: socket.id,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  };

  // Assign position to the new user
  userData.position = userPositionData.assignPosition(userData.id);
  console.log(userData.position);

  // Add the user data to metaData obj and emit it
  metaData.addUserData(socket.id, userData);

  // Why JSON?
  // Read this: https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/5344074#5344074
  // Why replacer (defined below)?
  // Read this: https://stackoverflow.com/a/56150320/11342472
  socket.emit("init", JSON.stringify(metaData, replacer), socket.id);
  socket.broadcast.emit("new user", JSON.stringify(userData));

  // Update position of characters in the scene
  socket.on("user movement update", (position) => {
    metaData.usersData.get(socket.id).position = position;
    const userData = metaData.getUserData(socket.id);
    socket.broadcast.emit("user movement update", JSON.stringify(userData));
  });

  // Update rotation of characters in the scene
  socket.on("user rotation update", (rotation) => {
    metaData.usersData.get(socket.id).rotation = rotation;
    const userData = metaData.getUserData(socket.id);
    socket.broadcast.emit("user rotation update", JSON.stringify(userData));
  });

  // Remove the user data from metaData obj on disconnection
  socket.on("disconnecting", () => {
    console.log(`User ${socket.id} disconnected`);
    metaData.removeUserData(socket.id);
    userPositionData.removeUserPosition(socket.id);
    socket.broadcast.emit("user disconnected", socket.id);
  });
});

httpServer.listen(
  PORT,
  console.log(`Listening on port http://localhost:${PORT}`)
);

// @desc    assign positions to users randomly so that characters don't bump into each other
const userPositionData = {
  users: new Map(),
  positions: new Set(),
  assignPosition: function (socketId) {
    let userPosition = { x: 0, y: 0, z: 0 };
    for (let i = 0; i < 10; i++) {
      userPosition = this.findPosition();
      if (this.positions.has(userPosition)) continue;
      else break;
    }
    this.positions.add(userPosition);
    this.users.set(socketId, userPosition);
    return userPosition;
  },
  findPosition: function () {
    let region = Math.floor(Math.random() * 4);
    switch (region) {
      case 0:
        // near back wall
        return {
          x: Math.floor(Math.random() * (22 - -22) - 22),
          y: 2,
          z: Math.floor(Math.random() * (22 - 20) + 20),
        };
      case 1:
        // near right wall
        return {
          x: Math.floor(Math.random() * (22 - 20) + 20),
          y: 2,
          z: Math.floor(Math.random() * (22 - -22) - 22),
        };
      case 2:
        // near front wall
        return {
          x: Math.floor(Math.random() * (22 - -22) - 22),
          y: 2,
          z: Math.floor(Math.random() * (-20 - -22) - 22),
        };
      case 3:
        // near left wall
        return {
          x: Math.floor(Math.random() * (-20 - -22) - 22),
          y: 2,
          z: Math.floor(Math.random() * (22 - -22) - 22),
        };
    }
  },
  removeUserPosition: function (socketId) {
    this.positions.delete(this.users.get(socketId));
    this.users.delete(socketId);
    console.log(this.positions);
    console.log(this.users);
  },
};

// @desc    logbook of all the information of metaverse world
const metaData = {
  usersData: new Map(),

  // maps socket.id to the user data such as position, shape, color, etc.
  addUserData: function (socketId, data) {
    this.usersData.set(socketId, data);
  },
  getUserData: function (socketId) {
    return this.usersData.get(socketId);
  },
  removeUserData: function (socketId) {
    this.usersData.delete(socketId);
  },
};

// @desc    required for serializing maps in JSON stringify
function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}
