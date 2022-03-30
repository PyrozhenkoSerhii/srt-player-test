import { QueueManager } from "./QueueManager";

const RESOLUTION = 1280 * 720;
const SAMPLE_RATE = 48000;
const FPS = 30;

const VIDEO_FRAME = 4 * RESOLUTION;
const AUDIO_FRAME = 4096;

const audioQueueManager = new QueueManager();
const videoQueueManager = new QueueManager();

let sentVideoPackagesCounter = 0;
let sentAudioPackagesCounter = 0;

let videoTimestamp = 0;
let audioTimestamp = 0;

let videoIncrement = 1000000 / FPS;
let audioIncrement = 1000000 / SAMPLE_RATE * 1024;

export const sendVideo = (socket, event: string, data: Buffer) => {
  videoQueueManager.putBuffer(data);
  
  if(videoQueueManager.getSize() > VIDEO_FRAME) {
    const result = videoQueueManager.getBuffer(VIDEO_FRAME);

    videoTimestamp += videoIncrement;

    console.log(`[${event}] Sent a 4*1280*720. Total packages sent: ${sentVideoPackagesCounter++}. Timestamp: ${videoTimestamp}`);

    socket.emit(event, { data: result, timestamp: videoTimestamp });
  }
}

export const sendAudio = (socket, event: string, data: Buffer) => {
  audioQueueManager.putBuffer(data);

  if(audioQueueManager.getSize() >= AUDIO_FRAME) {
    const buffers = audioQueueManager.getBuffer(AUDIO_FRAME, true);

    buffers.forEach((result) => {
      audioTimestamp += audioIncrement;
      console.log(`[${event}] Sent ${result.byteLength} bytes. Total packages sent: ${sentAudioPackagesCounter++}. Timestamp: ${audioTimestamp}`);

      socket.emit(event, { data: result, timestamp: audioTimestamp });
    })
  }
}