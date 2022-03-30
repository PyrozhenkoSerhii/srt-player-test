import { FrameStructure, GetAudioFrameFromQueueResponse, RenderClosestVideoFrameFunc, TransformedFrameStructure } from "../utils/interfaces";
import { getChannelsFromInterleave, int16ToFloat32BitPCM } from "../utils/data"

const BUFFER_SIZE = 1024;
const CHANNELS = 2;
const SAMPLE_RATE = 48000;

interface IConstructorProps {
  getAudioFromQueue: () => GetAudioFrameFromQueueResponse;
  renderClosestVideoFrame: RenderClosestVideoFrameFunc;
  fullLogs: boolean;
}
export class AudioPlayer {
  private context: AudioContext = null;

  private getAudioFromQueue: () => GetAudioFrameFromQueueResponse = null;

  private renderClosestVideoFrame: RenderClosestVideoFrameFunc = null;

  private fullLogs = false;

  constructor({ getAudioFromQueue, renderClosestVideoFrame, fullLogs }: IConstructorProps) {
    this.getAudioFromQueue = getAudioFromQueue;
    this.renderClosestVideoFrame = renderClosestVideoFrame;
    this.fullLogs = fullLogs;

    this.initializeContext();
  }

  public toggleContextStatus = () => {
    if (this.context.state === "suspended") {
      this.context.resume(); 
      console.log("[toggleContextStatus] context resumed");
    } else if (this.context.state === "running") {
      this.context.suspend();
      console.log("[toggleContextStatus] context suspended");
    }
  }

  private initializeContext = () => {
    this.context = new AudioContext({ sampleRate: SAMPLE_RATE });
    this.context.suspend();

    const output = this.context.createScriptProcessor(BUFFER_SIZE, CHANNELS, CHANNELS);

    output.onaudioprocess = (e) => {
      const { frame, queueLength } = this.getAudioFromQueue();

      if (!frame) {
        console.log(`[onaudioprocess] No audio. Playing zeros`);
        e.outputBuffer.getChannelData(0).set(new Float32Array(BUFFER_SIZE));
        e.outputBuffer.getChannelData(1).set(new Float32Array(BUFFER_SIZE));
        return;
      }

      if(this.fullLogs) {
        console.log(`[onaudioprocess] Playing audio "frame" with timestamp ${frame.timestamp}. Left in queue: ${queueLength}`);
      }
      e.outputBuffer.getChannelData(0).set(frame.left);
      e.outputBuffer.getChannelData(1).set(frame.right);

      this.renderClosestVideoFrame(frame);
    };

    output.connect(this.context.destination);
  }

  /**
   * Transforms raw audio format to play in audio context
   */
  public transformAudioFrame = ({ data, timestamp }: FrameStructure): TransformedFrameStructure => {
    const interleavedInt16Buffer = new Int16Array(data);

    const interleavedFloat32Buffer = int16ToFloat32BitPCM(interleavedInt16Buffer);

    const {
      leftChannel,
      rightChannel,
    } = getChannelsFromInterleave(interleavedFloat32Buffer);

    return {
      timestamp,
      left: leftChannel,
      right: rightChannel,
    }
  }
}