import { QueueManager } from "./QueueManager";

const targetBufferSize = 4 * 1280 * 720;

let sentVideoPackagesCounter = 0;
const queueManager = new QueueManager();
export const sendVideo = (socket, event: string, data: Buffer) => {
  queueManager.putBuffer(data);
  
  if(queueManager.getSize() > targetBufferSize) {
    const result = queueManager.getBuffer(targetBufferSize);

    console.log(`[${event}] Sent a 4*1280*720. Total packages sent: ${sentVideoPackagesCounter++}`);
    socket.emit(event, result);
  }
}

let sentAudioPackagesCounter = 0;
export const sendAudio = (socket, event: string, data: Buffer) => {
  console.log(`[${event}] Sent ${data.byteLength} bytes. Total packages sent: ${sentAudioPackagesCounter++}`);

  socket.emit(event, data);
}