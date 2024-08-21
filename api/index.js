const express = require("express");
const app = express();

const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server);
app.use(cors());

app.use(express.static(path.resolve("")));

let arr = [];
let playingArray = [];

io.on("connection", (socket) => {
  socket.on("find", (e) => {
    console.log("connected to the server");
    if (e.name != null) {
      arr.push(e.name);

      if (arr.length >= 2) {
        let p1obj = {
          p1name: arr[0],
          p1value: "X",
          p1move: "",
        };

        let p2obj = {
          p2name: arr[1],
          p2value: "O",
          p2move: "",
        };

        let obj = {
          p1: p1obj,
          p2: p2obj,
          sum: 1,
        };

        playingArray.push(obj);

        arr.splice(0, 2);

        io.emit("find", { allPlayers: playingArray });
        socket.broadcast.emit("find", { allPlayers: playingArray });
      } else {
        socket.emit("find", { allPlayers: [] });
      }
    }
  });
  socket.on("playing", (e) => {
    console.log("Received 'playing' event: ", e);
    let objToChange;
    if (e.value == "X") {
      objToChange = playingArray.find(
        (obj) => obj.p1 && obj.p1.p1name === e.name
      );
    } else if (e.value == "O") {
      objToChange = playingArray.find(
        (obj) => obj.p2 && obj.p2.p2name === e.name
      );
    }

    if (!objToChange) {
      return;
    }

    if (
      (e.value === "X" && objToChange.sum % 2 === 1) ||
      (e.value === "O" && objToChange.sum % 2 === 0)
    ) {
      if (e.value === "X") {
        objToChange.p1.p1move = e.id;
      } else {
        objToChange.p2.p2move = e.id;
      }

      objToChange.sum++;
    }
    io.emit("playing", { allPlayers: playingArray });
  });

  socket.on("gameover", (e) => {
    socket.emit("gameover", { winner: e.winner });

    playingArray = [];
  });
});
app.get("/", (req, res) => {
  return res.sendFile("../index.html");
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
