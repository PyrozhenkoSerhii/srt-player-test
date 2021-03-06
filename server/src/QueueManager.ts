export class QueueManager {
  private buffer: Uint8Array = null;

  private initBuffer = (newChunk: Buffer): number => {
    this.buffer = newChunk;
    return this.buffer.byteLength;
  }

  public putBuffer = (newChunk: Buffer): number => {
    if(!this.buffer) {
      return this.initBuffer(newChunk);
    }

    const bufferLength = this.buffer.byteLength + newChunk.byteLength;
    const resultBuffer = new Uint8Array(bufferLength);

    resultBuffer.set(this.buffer, 0);
    resultBuffer.set(newChunk, this.buffer.byteLength);
    
    this.buffer = resultBuffer;

    return this.buffer.byteLength;
  }

  public getMultipleBuffers = (length: number) => {
    const results = [];

    while (this.getSize() >= length) {
      results.push(this.getBuffer(length));
    }
    return results;
  }

  public getBuffer = (length: number, allowMultiple = false) => {
    if(allowMultiple) return this.getMultipleBuffers(length);

    const neededChunk = this.buffer.slice(0, length);
    this.buffer = this.buffer.slice(length);

    return neededChunk;
  }

  public getSize = () => {
    return this.buffer.byteLength;
  }
}