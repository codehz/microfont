import { Encode } from "../encoder";

export default class prep {
  @Encode.TypedArray
  program: Uint8Array;
  constructor(program: Uint8Array) {
    this.program = program;
  }
}
