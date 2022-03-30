interface IChannelsFromInterleave {
  leftChannel: Float32Array;
  rightChannel: Float32Array;
}

export const getChannelsFromInterleave = (interleave: Float32Array): IChannelsFromInterleave => {
  const length = interleave.length / 2;

  const leftChannel = new Float32Array(length);
  const rightChannel = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    leftChannel[i] = interleave[i * 2];
    rightChannel[i] = interleave[i * 2 + 1];
  }

  return { leftChannel, rightChannel };
};

export const int16ToFloat32BitPCM = (input: Int16Array): Float32Array => {
  let i = input.length;
  const output = new Float32Array(i);
  while (i--) {
    const int = input[i];
    output[i] = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
  }
  return output;
};