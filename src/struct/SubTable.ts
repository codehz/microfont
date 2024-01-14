import { Encode, sizeof } from "../encoder";

export abstract class SubTable16 {
  @Encode.uint16
  format: number;
  /** This is the length in bytes of the subtable */
  @Encode.uint16
  get length(): number {
    return sizeof(this);
  }
  constructor(format: number) {
    this.format = format;
  }
}

export abstract class SubTable32 {
  @Encode.uint16
  format: number;
  @Encode.uint16
  private readonly reserved: number = 0;
  /** This is the length in bytes of the subtable */
  @Encode.uint32
  get length(): number {
    return sizeof(this);
  }
  constructor(format: number) {
    this.format = format;
  }
}
