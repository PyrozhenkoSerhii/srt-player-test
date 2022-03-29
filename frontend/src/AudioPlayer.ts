
import { float32Concat, getChannelsFromInterleave, int16ToFloat32BitPCM} from "./utils"

export const BUFFER_SIZE = 2048;
export const CHANNELS = 2;
export const JITTER_BUFFER_SIZE = 4096;
export const SAMPLE_RATE = 48000;

export class AudioPlayer {
  private audioQueueLeft: Float32Array = null;
  private audioQueueRight: Float32Array = null;

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

  public onData = (data: ArrayBuffer) => {
    const interleavedInt16Buffer = new Int16Array(data);

    const interleavedFloat32Buffer = int16ToFloat32BitPCM(interleavedInt16Buffer);

    const {
      leftChannel,
      rightChannel,
    } = getChannelsFromInterleave(interleavedFloat32Buffer);

    if (this.isPlaying) {
      if (this.audioQueueLeft && this.audioQueueRight) {
        this.audioQueueLeft = float32Concat(this.audioQueueLeft, leftChannel);
        this.audioQueueRight = float32Concat(this.audioQueueRight, rightChannel);
      } else {
        if (leftChannel.length < JITTER_BUFFER_SIZE) {
          const leftInitialQueue = new Float32Array(JITTER_BUFFER_SIZE);
          const rightInitialQueue = new Float32Array(JITTER_BUFFER_SIZE);

          const zerosLength = JITTER_BUFFER_SIZE - leftChannel.length;

          const zeroArray = new Float32Array(zerosLength);

          leftInitialQueue.set(zeroArray);
          rightInitialQueue.set(zeroArray);

          leftInitialQueue.set(leftChannel, zerosLength);
          rightInitialQueue.set(rightChannel, zerosLength);

          this.audioQueueLeft = leftInitialQueue;
          this.audioQueueRight = rightInitialQueue;
        } else {
          this.audioQueueLeft = leftChannel;
          this.audioQueueRight = rightChannel;
        }
      }
    }
  }
}