import { AudioPlayer } from "./AudioPlayer";
import { FrameStructure } from "./interfaces";

export class Player {
  private videoFrames: FrameStructure[] = [];
  private audioFrames: FrameStructure[] = [];

  private currentFrame: FrameStructure = null;

  private canvas: HTMLCanvasElement = null;
  private context: CanvasRenderingContext2D = null;

  private audioPlayer: AudioPlayer = null;
  private active = false;

  constructor({ canvas }) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");

    this.audioPlayer = new AudioPlayer();
  }

  public togglePlayback = () => {
    this.active = !this.active;
    this.audioPlayer.togglePlayback();
  }

  public onVideoFrame = (frame: FrameStructure) => {
    // console.log(`Received a video-package of size: ${frame.data.byteLength}. Timestamp: ${frame.timestamp}`);

    console.log(this.active);
    if (this.active) {
      this.videoFrames.push(frame);
      this.renderVideoFrame(frame);
    }
  }

  public onAudioFrame = (frame: FrameStructure) => {
    // console.log(`Received a audio-package of size: ${frame.data.byteLength}. Timestamp: ${frame.timestamp}`);

    if (this.active) {
      this.audioPlayer.onData(frame);
      this.audioFrames.push(frame);
    }
  }

  private renderVideoFrame = (frame: FrameStructure) => {
    const array = new Uint8ClampedArray(frame.data);
    const image = new ImageData(array, 1280, 720);
    this.context.putImageData(image, 0, 0);

    this.currentFrame = frame;
  }
}