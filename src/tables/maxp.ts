import { Encode } from "../encoder";

export default class maxp {
  @Encode.Version16Dot16
  readonly version: [number, number] = [1,0];
  /** The number of glyphs in the font. */
  @Encode.uint16
  numGlyphs: number = 0;
  /** Maximum points in a non-composite glyph. */
  @Encode.uint16
  maxPoints: number = 0;
  /** Maximum contours in a non-composite glyph. */
  @Encode.uint16
  maxContours: number = 0;
  /** Maximum points in a composite glyph. */
  @Encode.uint16
  maxCompositePoints: number = 0;
  /** Maximum contours in a composite glyph. */
  @Encode.uint16
  maxCompositeContours: number = 0;
  /** 1 if instructions do not use the twilight zone (Z0), or 2 if instructions do use Z0; should be set to 2 in most cases. */
  @Encode.uint16
  maxZones: number = 2;
  /** Maximum points used in Z0. */
  @Encode.uint16
  maxTwilightPoints: number = 0;
  /** Number of Storage Area locations. */
  @Encode.uint16
  maxStorage: number = 0;
  /** Number of FDEFs, equal to the highest function number + 1. */
  @Encode.uint16
  maxFunctionDefs: number = 0;
  /** Number of IDEFs. */
  @Encode.uint16
  maxInstructionDefs: number = 0;
  /** Maximum stack depth across Font Program ('fpgm' table), CVT Program ('prep' table) and all glyph instructions (in the 'glyf' table). */
  @Encode.uint16
  maxStackElements: number = 0;
  /** Maximum byte count for glyph instructions. */
  @Encode.uint16
  maxSizeOfInstructions: number = 0;
  /** Maximum number of components referenced at “top level” for any composite glyph. */
  @Encode.uint16
  maxComponentElements: number = 0;
  /** Maximum levels of recursion; 1 for simple components. */
  @Encode.uint16
  maxComponentDepth: number = 1;
}
