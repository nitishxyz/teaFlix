/* eslint-disable no-console */
/* eslint-disable no-undef */
const fs = window.require("fs");

class Store {
  constructor(path) {
    this.path = path;
    this.createStore(path);
  }

  createStore(path) {
    if(!fs.existsSync(path)) {
      fs.writeFile(path, "", "utf8", (err) => {
        if (err) throw err;
        // console.log("The file has been saved!");
      });
    } else {
      // console.log("file already exists!");
    }
  }

  get() {
    if(fs.existsSync(this.path)) {
      return fs.readFileSync(this.path, "utf8");
    } else {
      // console.log("file not found!");
    }
  }

  set(data) {
    if(data) {
      data = JSON.stringify(data);
      fs.writeFile(this.path, data, "utf8", (err) => {
        if (err) throw err;
      // console.log("The file has been saved!");
      });
    }
  }

  save() {
    
  }

}
export default Store;