import { Encode } from "../encoder";

export class longHorMetric {
  /** Advance width, in font design units. */
  @Encode.uint16
  advanceWidth: number = 0;
  /** Glyph left side bearing, in font design units. */
  @Encode.int16
  lsb: number = 0;
  constructor( advanceWidth: number, leftSideBearing: number) {
    this.advanceWidth = advanceWidth;
    this.lsb = leftSideBearing;
  }
}

export default class hmtx {
  @Encode.array(longHorMetric)
  hMetrics: longHorMetric[] = [];
  @Encode.numarray(2)
  leftSideBearings: number[] = [];
}
