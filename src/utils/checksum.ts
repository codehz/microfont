export function calcChecksum(table: ArrayBuffer) {
  const arr = new DataView(table);
  let sum = 0;
  for (let i = 0; i < arr.byteLength; i += 4) {
    sum = (sum + arr.getUint32(i)) % 0x1_00_00_00_00;
  }
  return sum;
}
