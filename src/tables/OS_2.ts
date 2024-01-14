import { Encode } from "../encoder";
import { BitVector } from "../encoder/bitvector";

export default class OS_2 {
  static tablename = "OS/2";
  @Encode.uint16
  readonly version: number = 4;
  /** The Average Character Width parameter specifies the arithmetic average of the escapement (width) of all non-zero width glyphs in the font. */
  @Encode.int16
  xAvgCharWidth: number = 0;
  /** Indicates the visual weight (degree of blackness or thickness of strokes) of the characters in the font. Values from 1 to 1000 are valid. */
  @Encode.uint16
  usWeightClass: number = 400;
  /** Indicates a relative change from the normal aspect ratio (width to height ratio) as specified by a font designer for the glyphs in a font. */
  @Encode.uint16
  usWidthClass: number = 5;
  /** Indicates font embedding licensing rights for the font. */
  @Encode.uint16
  fsType = 0;
  /** The recommended horizontal size in font design units for subscripts for this font. */
  @Encode.int16
  ySubscriptXSize: number = 0;
  /** The recommended vertical size in font design units for subscripts for this font. */
  @Encode.int16
  ySubscriptYSize: number = 0;
  /** The recommended horizontal offset in font design units for subscripts for this font. */
  @Encode.int16
  ySubscriptXOffset: number = 0;
  /** The recommended vertical offset in font design units from the baseline for subscripts for this font. */
  @Encode.int16
  ySubscriptYOffset: number = 0;
  /** The recommended horizontal size in font design units for superscripts for this font. */
  @Encode.int16
  ySuperscriptXSize: number = 0;
  /** The recommended vertical size in font design units for superscripts for this font. */
  @Encode.int16
  ySuperscriptYSize: number = 0;
  /** The recommended horizontal offset in font design units for superscripts for this font. */
  @Encode.int16
  ySuperscriptXOffset: number = 0;
  /** The recommended vertical offset in font design units from the baseline for superscripts for this font. */
  @Encode.int16
  ySuperscriptYOffset: number = 0;
  /** Thickness of the strikeout stroke in font design units. */
  @Encode.int16
  yStrikeoutSize: number = 0;
  /** The position of the top of the strikeout stroke relative to the baseline in font design units. */
  @Encode.int16
  yStrikeoutPosition: number = 0;
  /** This parameter is a classification of font-family design. */
  @Encode.int16
  sFamilyClass: number = 0;
  /** This 10-byte series of numbers is used to describe the visual characteristics of a given typeface. These characteristics are then used to associate the font with other fonts of similar appearance having different names. The variables for each digit are listed below. The Panose values are fully described in the PANOSE Classification Metrics Guide, currently owned by Monotype Imaging and maintained at https://monotype.github.io/panose/. */
  @Encode.typed(BitVector)
  panose: BitVector = new BitVector(80);
  @Encode.typed(BitVector)
  ulUnicodeRange: BitVector = new BitVector(128);
  /** The four-character identifier for the vendor of the given type face. */
  @Encode.Tag
  achVendID: string = "XXXX";
  /** Contains information concerning the nature of the font patterns */
  @Encode.uint16
  fsSelection: number = 0;
  /** The minimum Unicode index (character code) in this font, according to the 'cmap' subtable for platform ID 3 and platform- specific encoding ID 0 or 1. For most fonts supporting Win-ANSI or other character sets, this value would be 0x0020. This field cannot represent supplementary character values (codepoints greater than 0xFFFF). Fonts that support supplementary characters should set the value in this field to 0xFFFF if the minimum index value is a supplementary character. */
  @Encode.uint16
  usFirstCharIndex: number = 0;
  /** The maximum Unicode index (character code) in this font, according to the 'cmap' subtable for platform ID 3 and encoding ID 0 or 1. This value depends on which character sets the font supports. This field cannot represent supplementary character values (codepoints greater than 0xFFFF). Fonts that support supplementary characters should set the value in this field to 0xFFFF. */
  @Encode.uint16
  usLastCharIndex: number = 0;
  /** The typographic ascender for this font. This field should be combined with the sTypoDescender and sTypoLineGap values to determine default line spacing. */
  @Encode.int16
  sTypoAscender: number = 0;
  /** The typographic descender for this font. This field should be combined with the sTypoAscender and sTypoLineGap values to determine default line spacing. */
  @Encode.int16
  sTypoDescender: number = 0;
  /** The typographic line gap for this font. This field should be combined with the sTypoAscender and sTypoDescender values to determine default line spacing. */
  @Encode.int16
  sTypoLineGap: number = 0;
  /** The “Windows ascender” metric. This should be used to specify the height above the baseline for a clipping region. */
  @Encode.uint16
  usWinAscent: number = 0;
  /** The “Windows descender” metric. This should be used to specify the vertical extent below the baseline for a clipping region. */
  @Encode.uint16
  usWinDescent: number = 0;
  /** This field is used to specify the code pages encompassed by the font file in the 'cmap' subtable for platform 3, encoding ID 1 (Microsoft platform, Unicode BMP). If the font file is encoding ID 0, then the Symbol Character Set bit should be set. */
  @Encode.typed(BitVector)
  ulCodePageRange: BitVector = new BitVector(64);
  /** This metric specifies the distance between the baseline and the approximate height of non-ascending lowercase letters measured in FUnits. This value would normally be specified by a type designer but in situations where that is not possible, for example when a legacy font is being converted, the value may be set equal to the top of the unscaled and unhinted glyph bounding box of the glyph encoded at U+0078 (LATIN SMALL LETTER X). If no glyph is encoded in this position the field should be set to 0.
   * 
   * This metric, if specified, can be used in font substitution: the xHeight value of one font can be scaled to approximate the apparent size of another.
   */
  @Encode.int16
  sxHeight: number = 0;
  /** This metric specifies the distance between the baseline and the approximate height of uppercase letters measured in FUnits. This value would normally be specified by a type designer but in situations where that is not possible, for example when a legacy font is being converted, the value may be set equal to the top of the unscaled and unhinted glyph bounding box of the glyph encoded at U+0048 (LATIN CAPITAL LETTER H). If no glyph is encoded in this position the field should be set to 0.
   * 
   * This metric, if specified, can be used in systems that specify type size by capital height measured in millimeters. It can also be used as an alignment metric; the top of a drop capital, for instance, can be aligned to the sCapHeight metric of the first line of text.
    */
  @Encode.int16
  sCapHeight: number = 0;
  /** This is the Unicode code point, in UTF-16 encoding, of a character that can be used for a default glyph if a requested character is not supported in the font. If the value of this field is zero, glyph ID 0 is to be used for the default character. This field cannot represent supplementary-plane character values (code points greater than 0xFFFF), and so applications are strongly discouraged from using this field. */
  @Encode.uint16
  usDefaultChar: number = 0;
  /** This is the Unicode code point, in UTF-16 encoding, of a character that can be used as a default break character. The break character is used to separate words and justify text. Most fonts specify U+0020 SPACE as the break character. This field cannot represent supplementary-plane character values (code points greater than 0xFFFF) , and so applications are strongly discouraged from using this field. */
  @Encode.uint16
  usBreakChar: number = 0;
  /** The maximum length of a target glyph context for any feature in this font. For example, a font which has only a pair kerning feature should set this field to 2. If the font also has a ligature feature in which the glyph sequence “f f i” is substituted by the ligature “ffi”, then this field should be set to 3. This field could be useful to sophisticated line-breaking engines in determining how far they should look ahead to test whether something could change that affects the line breaking. For chaining contextual lookups, the length of the string (covered glyph) + (input sequence) + (lookahead sequence) should be considered. */
  @Encode.uint16
  usMaxContext: number = 0;
}
