const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const { User, Room } = require("./classes");
const { format } = require("path");
const db = require("./db");
const port = process.env.PORT || 4000;
let users = new db("users.json");
let rooms = [];
let usernames = [];
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/signup", (req, res) => {
  const { u, p, pub_key } = req.query;
  let result = { status: "error", error: "unknown" };

  if (!users.search(u)) {
    users.add(u, {
      username: u,
      password: p,
      pub_key,
      friends: [],
      requests: [],
    });
    result.status = "ok";
    result.error = "none";
    res.send(JSON.stringify(result));
  } else {
    res.send(JSON.stringify(result));
  }
});
app.get("/login", (req, res) => {
  const { u, p } = req.query;
  user = users.search(u);
  let result = { status: "error", error: "unknown" };
  if (!!users) {
    if (p == user.password) {
      result.status = "ok";
      result.error = "none";
      res.send(JSON.stringify(result));
    } else {
      res.send(JSON.stringify(result));
    }
  }
});
app.get("/pub_key", (req, res) => {
  const { u } = req.query;
  let result = { status: "error", error: "unknown" };
  if (users.search(u)) {
    result.status = "ok";
    result.error = "none";
    result.pub_key = users.search(u).pub_key;
    res.send(JSON.stringify(result));
  } else {
    res.send(JSON.stringify(result));
  }
});

io.on("connection", (socket) => {
  socket.on("create", (username, guestName, encryptedKey) => {
    usernames.push(username);
    const user = new User(username, socket);
    const codes = rooms.map((room) => room.code);
    let code = Math.floor(Math.random() * 1000);
    let bool = codes.includes(code);
    while (bool) {
      code = Math.floor(Math.random() * 1000);
    }
    const room = new Room(user, code, encryptedKey);
    rooms.push(room);
    console.log(username, code);
    socket.emit("roomCreated", username, code, encryptedKey);
    room.emitAll("updateUsers", {
      users: room.users.map((user) => ({ username: user.username })),
    });
  });
  socket.on("join", (username, code) => {
    console.log("joining", code, rooms);
    console.log("joining", code, rooms);
    if (!rooms.map((room) => room.code).includes(code)) {
      const user = new User(username, socket);
      const room = rooms[findIndex(code)];
      room.addUser(user);
      console.log(username);
      socket.emit("roomJoined", username, code, room.key);

      room.emitAll("newUser", { username: username });
      console.log(room.users);
      room.emitAll("updateUsers", {
        users: room.users.map((user) => ({ username: user.username })),
      });
    } else {
      socket.emit("error", "no such room");
    }
  });
  socket.on("msg", (code, msg, username) => {
    const room = rooms[findIndex(code)];
    console.log(msg, username);
    room.emitAll("msg", { msg: msg, username: username });
  });
});

server.listen(port, () => {
  console.log(`listening on ${port}`);
});

function findIndex(code) {
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].code == code) {
      return i;
    }
  }
  return false;
}
