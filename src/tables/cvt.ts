import { Encode } from "../encoder";

export default class cvt {
  @Encode.numarray(2)
  values: number[];
  constructor(values: number[]) {
    this.values = values;
  }
}
