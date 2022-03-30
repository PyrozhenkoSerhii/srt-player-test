import { FrameStructure, GetAudioFrameFromQueueResponse, RenderClosestVideoFrameFunc, TransformedFrameStructure } from "./interfaces";
import { getChannelsFromInterleave, int16ToFloat32BitPCM} from "./utils"

export const BUFFER_SIZE = 1024;
export const CHANNELS = 2;
export const SAMPLE_RATE = 48000;

interface IConstructorProps {
  getAudioFromQueue: () => GetAudioFrameFromQueueResponse;
  renderClosestVideoFrame: RenderClosestVideoFrameFunc;
}
export class AudioPlayer {
  private isPlaying = false;

  private context: AudioContext = null;

  private getAudioFromQueue: () => GetAudioFrameFromQueueResponse = null;

  private renderClosestVideoFrame: RenderClosestVideoFrameFunc = null;

  constructor({ getAudioFromQueue, renderClosestVideoFrame }: IConstructorProps) {
    this.initializeContext();
    this.getAudioFromQueue = getAudioFromQueue;
    this.renderClosestVideoFrame = renderClosestVideoFrame;
  }

  public togglePlayback = () => {
    this.isPlaying = !this.isPlaying;

    if(this.isPlaying && this.context.state === "suspended") {
      this.context.resume(); 
      console.log("[togglePlayback] context resumed");
    } else if (!this.isPlaying && this.context.state === "running") {
      this.context.suspend();
      console.log("[togglePlayback] context suspended");
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

      console.log(`[onaudioprocess] Playing audio "frame" with timestamp ${frame.timestamp}. Left in queue: ${queueLength}`);

      e.outputBuffer.getChannelData(0).set(frame.left);
      e.outputBuffer.getChannelData(1).set(frame.right);

      this.renderClosestVideoFrame(frame);
      

      // if (this.audioQueueLeft && this.audioQueueLeft.length) {
      //   const samplesToPlayLeft = this.audioQueueLeft.subarray(0, BUFFER_SIZE);
      //   const samplesToPlayRight = this.audioQueueRight.subarray(0, BUFFER_SIZE);

      //   this.audioQueueLeft = this.audioQueueLeft.subarray(BUFFER_SIZE, this.audioQueueLeft.length);
      //   this.audioQueueRight = this.audioQueueRight.subarray(BUFFER_SIZE, this.audioQueueRight.length);

      //   e.outputBuffer.getChannelData(0).set(samplesToPlayLeft);
      //   e.outputBuffer.getChannelData(1).set(samplesToPlayRight);

      //   console.log(`[onaudioprocess] Length of left queue: ${this.audioQueueLeft.length} right: ${this.audioQueueRight.length}`);
      // } else {
      //   e.outputBuffer.getChannelData(0).set(new Float32Array(BUFFER_SIZE));
      //   e.outputBuffer.getChannelData(1).set(new Float32Array(BUFFER_SIZE));

      //   if (this.isPlaying) {
      //     console.log("[onaudioprocess] STUTTERED");
      //   }
      // }
    };
    output.connect(this.context.destination);
  }

  public transformAudioFrame = ({data, timestamp}: FrameStructure): TransformedFrameStructure => {
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

  // public onData = ({data, timestamp}: FrameStructure) => {
  //   const interleavedInt16Buffer = new Int16Array(data);

  //   const interleavedFloat32Buffer = int16ToFloat32BitPCM(interleavedInt16Buffer);

  //   const {
  //     leftChannel,
  //     rightChannel,
  //   } = getChannelsFromInterleave(interleavedFloat32Buffer);

  //   if(this.isPlaying) {
  //     this.audioQueueLeft = float32Concat(this.audioQueueLeft, leftChannel);
  //     this.audioQueueRight = float32Concat(this.audioQueueRight, rightChannel);
  //     return;
  //   }
  // }
}