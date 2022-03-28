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
  console.log('client connected');
  sendPipe(socket);

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

const sendPipe = (socket) => {
  const fifoPath = '/Users/user/video.fifo';

  const fifo = fs.createReadStream(fifoPath);

  const videoQueueManager = new QueueManager("video");

  let sentPackagesCounter = 0;
  
  fifo.on('data', data => {
    videoQueueManager.putBuffer(data);

    if(videoQueueManager.getSize() > targetBufferSize) {
      // console.log(`Got enough buffer to render. Total size: ${videoQueueManager.getSize()}`);
      const result = videoQueueManager.getBuffer(targetBufferSize);

      // console.log(`Sending buffer for render. Buffer remaining: ${videoQueueManager.getSize()}`);

      console.log(`Sent a 4*1280*720. Total packages sent: ${sentPackagesCounter++}`);

      socket.emit("stream-data", result);
    }
  });
}

const concatArrayBuffers = (arrayBuffers) => {
  let totalLength = 0;
  arrayBuffers.forEach((array) => {
    totalLength += array.byteLength
  })

  const result = new Uint8Array(totalLength);

  let offset = 0;
  arrayBuffers.forEach((arr) => {
    result.set(new Uint8Array(arr), offset);
    offset+=arr.byteLength;
  })

  return result;
}