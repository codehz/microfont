import { Encode } from "../encoder";

export default class post {
  @Encode.Version16Dot16
  readonly version: [number, number] = [3, 0];
  /** Italic angle in counter-clockwise degrees from the vertical. Zero for upright text, negative for text that leans to the right (forward). */
  @Encode.Fixed
  italicAngle: number = 0;
  /** This is the suggested distance of the top of the underline from the baseline (negative values indicate below baseline).
   *
   * The PostScript definition of this FontInfo dictionary key (the y coordinate of the center of the stroke) is not used for historical reasons. The value of the PostScript key may be calculated by subtracting half the underlineThickness from the value of this field.
   */
  @Encode.FWORD
  underlinePosition: number = 0;
  /** Suggested values for the underline thickness. In general, the underline thickness should match the thickness of the underscore character (U+005F LOW LINE), and should also match the strikeout thickness, which is specified in the OS/2 table. */
  @Encode.FWORD
  underlineThickness: number = 0;
  /** Set to 0 if the font is proportionally spaced, non-zero if the font is not proportionally spaced (i.e. monospaced). */
  @Encode.uint32
  isFixedPitch: number = 0;
  /** Minimum memory usage when an OpenType font is downloaded. */
  @Encode.uint32
  minMemType42: number = 0;
  /** Maximum memory usage when an OpenType font is downloaded. */
  @Encode.uint32
  maxMemType42: number = 0;
  /** Minimum memory usage when an OpenType font is downloaded as a Type 1 font. */
  @Encode.uint32
  minMemType1: number = 0;
  /** Maximum memory usage when an OpenType font is downloaded as a Type 1 font. */
  @Encode.uint32
  maxMemType1: number = 0;
}
