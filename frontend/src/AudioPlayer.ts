import { FrameStructure } from "./interfaces";
import { float32Concat, getChannelsFromInterleave, int16ToFloat32BitPCM} from "./utils"

export const BUFFER_SIZE = 1024;
export const CHANNELS = 2;
export const SAMPLE_RATE = 48000;

export class AudioPlayer {
  private audioQueueLeft: Float32Array = new Float32Array();
  private audioQueueRight: Float32Array = new Float32Array();

  private isPlaying = false;

  private context: AudioContext = null;

  constructor() {
    this.initializeContext();
  }

  public togglePlayback = () => {
    this.isPlaying = !this.isPlaying;

    if(this.isPlaying && this.context.state === "suspended") {
      this.context.resume(); 
      console.log("[togglePlayback] context resumed");
    } else if (!this.isPlaying && this.context.state === "running") {
      this.context.suspend();
      this.audioQueueLeft = new Float32Array();
      this.audioQueueRight = new Float32Array();
      console.log("[togglePlayback] context suspended");
    }
    
    console.log("[togglePlayback] Status isPlaying: ", this.isPlaying);
  }

  private initializeContext = () => {
    this.context = new AudioContext({ sampleRate: SAMPLE_RATE });
    this.context.suspend();

    const output = this.context.createScriptProcessor(BUFFER_SIZE, CHANNELS, CHANNELS);

    output.onaudioprocess = (e) => {
      if (this.audioQueueLeft && this.audioQueueLeft.length) {
        const samplesToPlayLeft = this.audioQueueLeft.subarray(0, BUFFER_SIZE);
        const samplesToPlayRight = this.audioQueueRight.subarray(0, BUFFER_SIZE);

        this.audioQueueLeft = this.audioQueueLeft.subarray(BUFFER_SIZE, this.audioQueueLeft.length);
        this.audioQueueRight = this.audioQueueRight.subarray(BUFFER_SIZE, this.audioQueueRight.length);

        e.outputBuffer.getChannelData(0).set(samplesToPlayLeft);
        e.outputBuffer.getChannelData(1).set(samplesToPlayRight);

        console.log(`[onaudioprocess] Length of left queue: ${this.audioQueueLeft.length} right: ${this.audioQueueRight.length}`);
      } else {
        e.outputBuffer.getChannelData(0).set(new Float32Array(BUFFER_SIZE));
        e.outputBuffer.getChannelData(1).set(new Float32Array(BUFFER_SIZE));

        if (this.isPlaying) {
          console.log("[onaudioprocess] STUTTERED");
        }
      }
    };
    output.connect(this.context.destination);
  }

  private lastData = null;


  public onData = ({data}: FrameStructure) => {
    const now = Date.now();

    console.log(`Received ${data.byteLength}bytes. Since last data: ${(now - this.lastData).toFixed(2)}`)

    this.lastData = now;

    const interleavedInt16Buffer = new Int16Array(data);

    const interleavedFloat32Buffer = int16ToFloat32BitPCM(interleavedInt16Buffer);

    const {
      leftChannel,
      rightChannel,
    } = getChannelsFromInterleave(interleavedFloat32Buffer);

    if(this.isPlaying) {
      this.audioQueueLeft = float32Concat(this.audioQueueLeft, leftChannel);
      this.audioQueueRight = float32Concat(this.audioQueueRight, rightChannel);
      return;
    }
  }
}