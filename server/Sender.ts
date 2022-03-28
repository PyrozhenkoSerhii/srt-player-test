import fs from "fs"
import { QueueManager } from "./QueueManager";

const targetBufferSize = 4 * 1280 * 720;

export const sendVideo = (socket, fifoPath: string, event: string) => {
  const fifo = fs.createReadStream(fifoPath);

  const queueManager = new QueueManager(event);

  let sentPackagesCounter = 0;

  console.log(`Created a createReadStream for ${fifoPath}. Waiting for a data event`);
  
  fifo.on('data', (data: Buffer) => {
    queueManager.putBuffer(data);

    if(queueManager.getSize() > targetBufferSize) {
      const result = queueManager.getBuffer(targetBufferSize);

      console.log(`[${fifoPath}] Sent a 4*1280*720. Total packages sent: ${sentPackagesCounter++}`);
      socket.emit(event, result);
    }
  });
}


export const sendAudio = (socket, fifoPath: string, event: string) => {
  const fifo = fs.createReadStream(fifoPath);

  let sentPackagesCounter = 0;

  console.log(`Created a createReadStream for ${fifoPath}. Waiting for a data event`);
  
  fifo.on('data', (data: Buffer) => {
    console.log(`[${fifoPath}] Sent ${data.byteLength} bytes. Total packages sent: ${sentPackagesCounter++}`);

    socket.emit(event, data);
  });
}