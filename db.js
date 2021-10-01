const fs = require("fs");

class db {
  constructor(fileName) {
    this.fileName = fileName;
    this.data = JSON.parse(
      fs.readFileSync(fileName, { encoding: "utf8", flag: "r" })
    );
  }
  search(string) {
    if (!!this.data[string]) {
      return this.data[string];
    }
    return undefined;
  }
  add(string, data) {
    if (!this.data[string]) {
      this.data[string] = data;
      fs.writeFile(this.fileName, JSON.stringify(this.data), (err) => {
        if (err) {
          console.log(err);
          console.log("added");
        }
      });
    }
    // this.update();
    return this;
  }
  remove(string) {
    if (!!this.data[string]) {
      delete this.data[string];
      fs.writeFile(this.fileName, JSON.stringify(this.data), (err) => {
        if (err) {
          console.log(err);
          console.log("removed");
        }
      });
    }
    // this.update();
    return this;
  }
  edit(string, value) {
    if (!this.data[string]) {
      this.data[string] = value;
      fs.writeFile(this.fileName, JSON.stringify(this.data), (err) => {
        if (err) {
          console.log(err);
        }
        console.log("edited");
      });
    }
    // this.update();
    return this;
  }
  // update() {
  //   // console.log(
  //   //   fs.readFileSync(this.fileName, { encoding: "utf8", flag: "r" }),
  //   //   "ok"
  //   // );
  //   fs.readFile(this.fileName, { encoding: "utf8" }, (err, data) => {
  //     this.data = JSON.parse(data);
  //   });
  //   return this;
  // }
}

module.exports = db;
