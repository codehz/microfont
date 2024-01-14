import { Encode } from ".";

export class BitVector {
  @Encode.TypedArray
  readonly data: Uint8Array;
  constructor(public length: number) {
    this.data = new Uint8Array(Math.ceil(length / 8));
  }

  set(offset: number, value: boolean) {
    if (value) {
      this.data[offset >> 3] |= 1 << (offset & 0b111);
    } else {
      this.data[offset >> 3] &= ~(1 << (offset & 0b111));
    }
  }

  get(offset: number) {
    return (this.data[offset >> 3] & (1 << (offset & 0b111))) !== 0;
  }

  clear() {
    this.data.fill(0);
  }
}
