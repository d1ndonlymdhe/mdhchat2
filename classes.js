class User {
  constructor(name, socket) {
    this.username = name;
    this.socket = socket;
  }
}
class Room {
  users = [];
  constructor(user, code, key) {
    this.users.push(user);
    this.code = code;
    this.key = key;
  }
  addUser(user) {
    this.users.push(user);
  }
  emitAll(why, msg) {
    const sockets = this.users.map((user) => user.socket);
    sockets.forEach((socket) => {
      socket.emit(why, msg);
      console.log(msg);
    });
  }
}

module.exports = { User, Room };
