import { Encode } from "../encoder";

const dummy = new DataView(new ArrayBuffer(0));

export default class loca {
  /** In short version, The actual local offset divided by 2 is stored.
   *
   * In long version, The actual local offset is stored.
   *
   * The value of n is numGlyphs + 1. The value for numGlyphs is found in the 'maxp' table.
   */
  @Encode.DataView
  offsets: DataView = dummy;
  constructor() {}

  update(offsets: number[]) {
    const long = offsets.some((x) => x >= 0xff_ff * 2);
    if (long) {
      const { buffer } = new Uint32Array(offsets.length);
      const view = new DataView(buffer);
      for (let i = 0; i < offsets.length; i++) {
        view.setUint32(i * 4, offsets[i]);
      }
      this.offsets = view;
    } else {
      const { buffer } = new Uint16Array(offsets.length);
      const view = new DataView(buffer);
      for (let i = 0; i < offsets.length; i++) {
        view.setUint16(i * 2, offsets[i] / 2);
      }
      this.offsets = view;
    }
    return long;
  }
}
