import { Encode } from "../encoder";

const reserved16x4 = new Uint16Array(4);

export default class hhea {
  @Encode.Version16Dot16
  readonly version: [number, number] = [1, 0];
  /** Typographic ascent */
  @Encode.FWORD
  ascender: number = 0;
  /** Typographic descent */
  @Encode.FWORD
  descender: number = 0;
  /** Typographic line gap.
   * Negative LineGap values are treated as zero in some legacy platform implementations */
  @Encode.FWORD
  lineGap: number = 0;
  /** Maximum advance width value in 'hmtx' table. */
  @Encode.UFWORD
  advanceWidthMax: number = 0;
  /** Minimum left sidebearing value in 'hmtx' table for glyphs with contours (empty glyphs should be ignored). */
  @Encode.FWORD
  minLeftSideBearing: number = 0;
  /** Minimum right sidebearing value in 'hmtx' table for glyphs with contours (empty glyphs should be ignored). */
  @Encode.FWORD
  minRightSideBearing: number = 0;
  /** Max(lsb + (xMax - xMin)). */
  @Encode.FWORD
  xMaxExtent: number = 0;
  /** Used to calculate the slope of the cursor (rise/run); 1 for vertical. */
  @Encode.int16
  caretSlopeRise: number = 1;
  /** 0 for vertical. */
  @Encode.int16
  caretSlopeRun: number = 0;
  /** The amount by which a slanted highlight on a glyph needs to be shifted to produce the best appearance. Set to 0 for non-slanted fonts */
  @Encode.int16
  caretOffset: number = 0;
  @Encode.TypedArray
  readonly reserved = reserved16x4;
  /** 0 for current format. */
  @Encode.int16
  readonly metricDataFormat: number = 0;
  /** Number of hMetric entries in 'hmtx' table */
  @Encode.uint16
  numberOfHMetrics: number = 0;
}
