import path from 'path';
import express from "express";
import {createServer} from "http";

import { sendAudio, sendVideo } from './Sender';

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

app.use(express.static(path.join(__dirname, frontendPath)))
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, frontendPath, "index.html"));
})

server.listen(PORT, () => {
  console.log(`Running server on port ${PORT}`)
});

io.on('connection', (socket) => {
  console.log('Client connected ', socket.id);

  sendVideo(socket, '/Users/user/video.fifo', "video-package");
  sendAudio(socket, '/Users/user/audio.fifo', "audio-package");

  socket.on('disconnect', () => { console.log("Client disconnected ", socket.id)});
});


