const fs = require('fs');
const path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
var net = require('net');
var cors = require('cors')
 
app.use(cors())
const frontendPath = "/frontend/build";
app.use(express.static(path.join(__dirname, frontendPath)))
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, frontendPath, "index.html"));
})

server.listen(8000, () => {
  console.log('running on port 8000')
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  sendVideo(socket, '/Users/user/video.fifo', "video-package");
  sendAudio(socket, '/Users/user/audio.fifo', "audio-package");

  socket.on('disconnect', () => { console.log("Client disconnected" )});
});


let buffers = [];

class QueueManager {
  buffer = null;
  id = null;

  constructor(id) {
    this.id = id;
  }

  initBuffer = (newChunk) => {
    this.buffer = newChunk;
  }

  putBuffer = (newChunk) => {
    if(!this.buffer) {
      return this.initBuffer(newChunk);
    }

    const bufferLength = this.buffer.byteLength + newChunk.byteLength;
    const resultBuffer = new Uint8Array(bufferLength);

    resultBuffer.set(this.buffer, 0);
    resultBuffer.set(newChunk, this.buffer.byteLength);
    
    this.buffer = resultBuffer;
  }

  getBuffer = (length) => {
    const neededChunk = this.buffer.slice(0, length);
    this.buffer = this.buffer.slice(length);

    return neededChunk;
  }

  getSize = () => {
    return this.buffer.byteLength;
  }

  getId = () => {
    return this.id;
  }
}


const targetBufferSize = 4 * 1280 * 720;

const sendVideo = (socket, fifoPath, event) => {
  const fifo = fs.createReadStream(fifoPath);

  const queueManager = new QueueManager(event);

  let sentPackagesCounter = 0;

  console.log(`Created a createReadStream for ${fifoPath}. Waiting for a data event`);
  
  fifo.on('data', data => {
    queueManager.putBuffer(data);

    if(queueManager.getSize() > targetBufferSize) {
      const result = queueManager.getBuffer(targetBufferSize);

      console.log(`[${fifoPath}] Sent a 4*1280*720. Total packages sent: ${sentPackagesCounter++}`);
      socket.emit(event, result);
    }
  });
}


const sendAudio = (socket, fifoPath, event) => {
  const fifo = fs.createReadStream(fifoPath);

  const queueManager = new QueueManager(event);

  let sentPackagesCounter = 0;

  console.log(`Created a createReadStream for ${fifoPath}. Waiting for a data event`);
  
  fifo.on('data', data => {
    console.log(`[${fifoPath}] Sent ${data.byteLength} bytes. Total packages sent: ${sentPackagesCounter++}`);

    socket.emit(event, data);
  });
}


// const sendPipe = (socket, fifoPath, event) => {
//   const fifo = fs.createReadStream(fifoPath);

//   const queueManager = new QueueManager(event);

//   let sentPackagesCounter = 0;
  
//   fifo.on('data', (data) => {
//     queueManager.putBuffer(data as Buffer);

//     if(queueManager.getSize() > targetBufferSize) {
//       // console.log(`Got enough buffer to render. Total size: ${queueManager.getSize()}`);
//       const result = queueManager.getBuffer(targetBufferSize);

//       // console.log(`Sending buffer for render. Buffer remaining: ${queueManager.getSize()}`);

//       console.log(`[${fifoPath}] Sent a 4*1280*720. Total packages sent: ${sentPackagesCounter++}`);

//       socket.emit(event, result);
//     }
//   });
// }
