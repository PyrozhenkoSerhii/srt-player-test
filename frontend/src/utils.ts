export const float32Concat = (first: Float32Array, second: Float32Array): Float32Array => {
  const firstLength = first.length;
  const result = new Float32Array(firstLength + second.length);

  result.set(first);
  result.set(second, firstLength);

  return result;
};

export const createChannelsInterleave = (
  leftChannel: Float32Array,
  rightChannel: Float32Array,
): Float32Array => {
  const length = leftChannel.length + rightChannel.length;

  const result = new Float32Array(length);

  let inputIndex = 0;

  for (let index = 0; index < length;) {
    result[index++] = leftChannel[inputIndex];
    result[index++] = rightChannel[inputIndex];
    inputIndex++;
  }
  return result;
};

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

export const floatTo16BitPCM = (input: Float32Array): Int16Array => {
  let i = input.length;
  const output = new Int16Array(i);
  while (i--) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
  }
  return output;
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