import { Encode } from "../encoder";

export default class head {
  @Encode.Version16Dot16
  readonly version: [number, number] = [1, 0];
  @Encode.Fixed
  fontRevision: number = 0;
  /** 	To compute: set it to 0, sum the entire font as uint32, then store 0xB1B0AFBA - sum. If the font is used as a component in a font collection file, the value of this field will be invalidated by changes to the file structure and font table directory, and must be ignored. */
  @Encode.uint32
  checksumAdjustment: number = 0;
  @Encode.uint32
  readonly magicNumber: number = 0x5f_0f_3c_f5;
  /**
   * **Bit 0:** Baseline for font at y=0.
   *
   * **Bit 1:** Left sidebearing point at x=0 (relevant only for TrueType rasterizers) — see the note below regarding variable fonts.
   *
   * **Bit 2:** Instructions may depend on point size.
   *
   * **Bit 3:** Force ppem to integer values for all internal scaler math; may use fractional ppem sizes if this bit is clear. It is strongly recommended that this be set in hinted fonts.
   *
   * **Bit 4:** Instructions may alter advance width (the advance widths might not scale linearly).
   *
   * **Bit 5:** This bit is not used in OpenType, and should not be set in order to ensure compatible behavior on all platforms. If set, it may result in different behavior for vertical layout in some platforms. (See Apple’s specification for details regarding behavior in Apple platforms.)
   *
   * **Bits 6–10:** These bits are not used in Opentype and should always be cleared. (See Apple’s specification for details regarding legacy used in Apple platforms.)
   *
   * **Bit 11:** Font data is “lossless” as a result of having been subjected to optimizing transformation and/or compression (such as e.g. compression mechanisms defined by ISO/IEC 14496-18, MicroType Express, WOFF 2.0 or similar) where the original font functionality and features are retained but the binary compatibility between input and output font files is not guaranteed. As a result of the applied transform, the DSIG table may also be invalidated.
   *
   * **Bit 12:** Font converted (produce compatible metrics).
   *
   * **Bit 13:** Font optimized for ClearType™. Note, fonts that rely on embedded bitmaps (EBDT) for rendering should not be considered optimized for ClearType, and therefore should keep this bit cleared.
   *
   * **Bit 14:** Last Resort font. If set, indicates that the glyphs encoded in the 'cmap' subtables are simply generic symbolic representations of code point ranges and don’t truly represent support for those code points. If unset, indicates that the glyphs encoded in the 'cmap' subtables represent proper support for those code points.
   *
   * **Bit 15:** Reserved, set to 0.
   */
  @Encode.uint16
  flags: number = 0x2;
  /** Set to a value from 16 to 16384. Any value in this range is valid. In fonts that have TrueType outlines, a power of 2 is recommended as this allows performance optimizations in some rasterizers. */
  @Encode.uint16
  unitsPerEm: number = 0;
  /** Number of seconds since 12:00 midnight that started January 1st 1904 in GMT/UTC time zone. */
  @Encode.LONGDATETIME
  created: number = 0;
  /** Number of seconds since 12:00 midnight that started January 1st 1904 in GMT/UTC time zone. */
  @Encode.LONGDATETIME
  modified: number = 0;
  /** Minimum x coordinate across all glyph bounding boxes. */
  @Encode.int16
  xMin: number = 0;
  /** Minimum y coordinate across all glyph bounding boxes. */
  @Encode.int16
  yMin: number = 0;
  /** Maximum x coordinate across all glyph bounding boxes. */
  @Encode.int16
  xMax: number = 0;
  /** Maximum y coordinate across all glyph bounding boxes. */
  @Encode.int16
  yMax: number = 0;
  /**
   * **Bit 0:** Bold (if set to 1);
   *
   * **Bit 1:** Italic (if set to 1)
   *
   * **Bit 2:** Underline (if set to 1)
   *
   * **Bit 3:** Outline (if set to 1)
   *
   * **Bit 4:** Shadow (if set to 1)
   *
   * **Bit 5:** Condensed (if set to 1)
   *
   * **Bit 6:** Extended (if set to 1)
   *
   * **Bits 7–15:** Reserved (set to 0).
   */
  @Encode.uint16
  macStyle: number = 0;
  /** Smallest readable size in pixels. */
  @Encode.uint16
  lowestRecPPEM: number = 0;
  /** @deprecated */
  @Encode.int16
  readonly fontDirectionHint: number = 2;
  /** 0 for short offsets (Offset16), 1 for long (Offset32). */
  @Encode.int16
  indexToLocFormat: number = 0;
  /** 0 for current format. */
  @Encode.int16
  readonly glyphDataFormat: number = 0;
}
