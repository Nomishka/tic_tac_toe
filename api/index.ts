import express, { Request, Response } from "express";
import path from "path";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(cors());

app.use(express.static(path.resolve("")));

interface Player {
  p1name: string;
  p1value: string;
  p1move: string;
  p2name: string;
  p2value: string;
  p2move: string;
  sum: number;
}

let arr: string[] = [];
let playingArray: Player[] = [];

io.on("connection", (socket: Socket) => {
  socket.on("find", (e: { name: string }) => {
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

        let obj: Player = {
          p1name: p1obj.p1name,
          p1value: p1obj.p1value,
          p1move: p1obj.p1move,
          p2name: p2obj.p2name,
          p2value: p2obj.p2value,
          p2move: p2obj.p2move,
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
  socket.on("playing", (e: { value: string; id: string; name: string }) => {
    console.log("Received 'playing' event: ", e);
    let objToChange: Player | undefined;
    if (e.value == "X") {
      objToChange = playingArray.find((obj) => obj.p1name === e.name);
    } else if (e.value == "O") {
      objToChange = playingArray.find((obj) => obj.p2name === e.name);
    }

    if (!objToChange) {
      return;
    }

    if (e.value === "X") {
      objToChange.p1move = e.id;
    } else if (e.value === "O") {
      objToChange.p2move = e.id;
    }

    objToChange.sum++;

    io.emit("playing", { allPlayers: playingArray });
    socket.broadcast.emit("Playing", { allPlayers: playingArray });
  });

  socket.on("gameover", (e: { winner: string }) => {
    console.log("Game over, winner: ", e.winner);
    io.emit("gameover", e);
  });
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
