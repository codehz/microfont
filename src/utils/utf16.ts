export const encodeToUtf16 = (str: string) => {
  const buffer = new ArrayBuffer(str.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < str.length; i++) {
    view.setUint16(i * 2, str.charCodeAt(i));
  }
  return buffer;
};
