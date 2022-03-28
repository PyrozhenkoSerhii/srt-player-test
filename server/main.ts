import path from 'path';
import express from "express";
import {createServer} from "http";

import { sendAudio, sendVideo } from './Sender';
import {TcpServer, audioPort, videoPort} from "./TcpServer"

const app = express();
const server = createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
 
const frontendPath = "/frontend/build";
const PORT = 8000;

const videoServer = new TcpServer(videoPort);
const audioServer = new TcpServer(audioPort);

app.use(express.static(path.join(__dirname, frontendPath)))
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, frontendPath, "index.html"));
})

server.listen(PORT, () => {
  console.log(`Running server on port ${PORT}`)
});

io.on('connection', (socket) => {
  console.log('Client connected ', socket.id);

  videoServer.setDataHandler((data) => {
    sendVideo(socket, "video-package", data);
  })

  audioServer.setDataHandler((data) => {
    sendAudio(socket, "audio-package", data);
  })

  socket.on('disconnect', () => { console.log("Client disconnected ", socket.id)});
});
