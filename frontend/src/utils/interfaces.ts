export interface FrameStructure {
  timestamp: number;
  data: Uint8Array
}

export interface TransformedFrameStructure {
  timestamp: number;
  left: Float32Array;
  right: Float32Array;
}

export interface GetAudioFrameFromQueueResponse {
  frame: TransformedFrameStructure|null;
  queueLength: number;
}

export type RenderClosestVideoFrameFunc = (audioFrame: TransformedFrameStructure) => void;