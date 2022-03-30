import { AudioPlayer } from "./AudioPlayer";
import { FrameStructure, GetAudioFrameFromQueueResponse, TransformedFrameStructure } from "./interfaces";

export class Player {
  private videoFrames: FrameStructure[] = [];
  private audioFrames: TransformedFrameStructure[] = [];

  private currentVideoFrame: FrameStructure = null;

  private canvas: HTMLCanvasElement = null;
  private context: CanvasRenderingContext2D = null;

  private audioPlayer: AudioPlayer = null;
  private active = false;

  constructor({ canvas }) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");

    this.audioPlayer = new AudioPlayer({
      getAudioFromQueue: this.getAudioFromQueue,
      renderClosestVideoFrame: this.renderClosestVideoFrame,
    });
  }

  public togglePlayback = () => {
    this.active = !this.active;
    this.audioPlayer.togglePlayback();

    if(!this.active) {
      this.clearQueues();
    }
  }

  private getFramesDiff = (audioFrame: TransformedFrameStructure, videoFrame: FrameStructure): number|null => {
    if(!videoFrame) return null;

    return Math.abs(audioFrame.timestamp - videoFrame.timestamp);
  }

  public renderClosestVideoFrame = (audioFrame: TransformedFrameStructure): void => {
    if(!this.videoFrames.length) {
      return console.log('[renderClosestVideoFrame] Nothing to render');
    }
    
    if(!this.currentVideoFrame) { // first render
      this.renderVideoFrame(this.videoFrames.shift());
    }

    const currentFrameDiff = this.getFramesDiff(audioFrame, this.currentVideoFrame);
    let firstFrameDiff = this.getFramesDiff(audioFrame, this.videoFrames[0]);
    let secondFrameDiff = this.getFramesDiff(audioFrame, this.videoFrames[1]);

    if (currentFrameDiff < firstFrameDiff) return; // no need to rerender, we display the closest frame

    if (!secondFrameDiff) { // next frame is the only one we have and it's closer than current
      return this.renderVideoFrame(this.videoFrames.shift());
    }

    if(firstFrameDiff < secondFrameDiff) { // next frame is closer than the one after it
      return this.renderVideoFrame(this.videoFrames.shift());
    }

    while (secondFrameDiff < firstFrameDiff) { // keep each two frames
      this.videoFrames.shift(); // removing current first frame

      firstFrameDiff = this.getFramesDiff(audioFrame, this.videoFrames[0]);
      secondFrameDiff = this.getFramesDiff(audioFrame, this.videoFrames[1]);
    }

    return this.renderVideoFrame(this.videoFrames.shift());
  }

  public onVideoFrame = (frame: FrameStructure): void => {
    // console.log(`Received a video-package of size: ${frame.data.byteLength}. Timestamp: ${frame.timestamp}`);

    if (this.active) {
      this.videoFrames.push(frame);
    }
  }

  public onAudioFrame = (frame: FrameStructure): void => {
    // console.log(`Received a audio-package of size: ${frame.data.byteLength}. Timestamp: ${frame.timestamp}`);

    if (this.active) {
      const transformedFrame = this.audioPlayer.transformAudioFrame(frame);
      this.audioFrames.push(transformedFrame);
    }
  }

  private getAudioFromQueue = (): GetAudioFrameFromQueueResponse => {
    if (!this.audioFrames.length) {
      return {
        frame: null,
        queueLength: 0,
      };
    } 

    return {
      frame: this.audioFrames.shift(),
      queueLength: this.audioFrames.length,
    }
  }

  private renderVideoFrame = (frame: FrameStructure): void => {
    console.log(`[renderVideoFrame] Rendering video "frame" with timestamp ${frame.timestamp}. Left in queue: ${this.videoFrames.length}`);

    const array = new Uint8ClampedArray(frame.data);
    const image = new ImageData(array, 1280, 720);
    this.context.putImageData(image, 0, 0);

    this.currentVideoFrame = frame;
  }

  private clearQueues = (): void => {
    this.audioFrames = [];
    this.videoFrames = [];
  }
}