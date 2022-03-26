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

server.listen(8000);

io.on('connection', (socket) => {
  console.log('client connected');
  sendPipe(socket);

  socket.on('disconnect', () => { console.log("Client disconnected" )});
});


let buffers = [];

const sendPipe = (socket) => {
  const fifoPath = '/Users/user/ffmpeg.pipe';

  const fifo = fs.createReadStream(fifoPath);
  
  fifo.on('data', data => {
    buffers.push(data);
    // console.log(`Got new ArrayBuffer of length ${data.byteLength}. Bufferred amount: ${buffers.length}`);

    if(buffers.length >= 450) {
      const result = concatArrayBuffers(buffers)
      console.log(`Concatanated ${buffers.length} buffers. Result length: ${result.byteLength}`);
      buffers = [];

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