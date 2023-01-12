/**
 * Converts encodings. Do not use to convert from or to binary.
 * @param input 
 * @param from 
 * @param to 
 * @returns 
 */
function convert(input: string, from: BufferEncoding, to: BufferEncoding) {
  return Buffer.from(input, from).toString(to);
}

function toBinary(input: string, from: BufferEncoding) {
  return Buffer.from(input, from);
}

function fromBinary(input: Buffer, to: BufferEncoding) {
  return input.toString(to);
}

function compareBinary(a: Buffer, b: Buffer) {
  return a.compare(b) === 0;
}

export const encoding = {
  convert,
  toBinary,
  fromBinary,
  compareBinary,
}