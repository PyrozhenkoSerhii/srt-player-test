export class QueueManager {
  private buffer: Uint8Array = null;
  private id: string = null;

  constructor(id: string) {
    this.id = id;
  }

  private initBuffer = (newChunk: Buffer) => {
    this.buffer = newChunk;
  }

  public putBuffer = (newChunk: Buffer) => {
    if(!this.buffer) {
      return this.initBuffer(newChunk);
    }

    const bufferLength = this.buffer.byteLength + newChunk.byteLength;
    const resultBuffer = new Uint8Array(bufferLength);

    resultBuffer.set(this.buffer, 0);
    resultBuffer.set(newChunk, this.buffer.byteLength);
    
    this.buffer = resultBuffer;
  }

  public getBuffer = (length: number) => {
    const neededChunk = this.buffer.slice(0, length);
    this.buffer = this.buffer.slice(length);

    return neededChunk;
  }

  public getSize = () => {
    return this.buffer.byteLength;
  }

  public getId = () => {
    return this.id;
  }
}