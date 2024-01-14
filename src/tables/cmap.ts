import { Encode, sizeof } from "../encoder";
import { MacintoshEncodingID } from "../enum/MacintoshEncodingID";
import { PlatformID } from "../enum/PlatformID";
import { UnicodeEncodingID } from "../enum/UnicodeEncodingID";
import { WindowsEncodingID } from "../enum/WindowsEncodingID";
import { SubTable16, SubTable32 } from "../struct/SubTable";

export class EncodingRecord {
  /** Platform ID. */
  @Encode.uint16
  platformID: PlatformID = PlatformID.Unicode;
  /** Platform-specific encoding ID. */
  @Encode.uint16
  encodingID: UnicodeEncodingID | WindowsEncodingID | MacintoshEncodingID = 0;
  /** Byte offset from beginning of table to the subtable for this encoding. */
  @Encode.Offset32
  subtableOffset: number = 0;
  constructor(
    platformID: PlatformID,
    encodingID: UnicodeEncodingID | WindowsEncodingID | MacintoshEncodingID,
    subtableOffset: number
  ) {
    this.platformID = platformID;
    this.encodingID = encodingID;
    this.subtableOffset = subtableOffset;
  }
}

export class cmap_subtable_format0 extends SubTable16 {
  @Encode.uint16
  readonly language: number = 0;
  @Encode.TypedArray
  glyphIdArray: Uint8Array = new Uint8Array(256);
}

export type CharacterMap = {
  glyphId: number;
  code: number;
};

export class cmap_subtable_format4 extends SubTable16 {
  @Encode.uint16
  readonly language: number = 0;
  /** 2 × segCount. */
  @Encode.uint16
  segCountX2: number = 0;
  /** Maximum power of 2 less than or equal to segCount, times 2 ((2**floor(log2(segCount))) * 2, where “**” is an exponentiation operator) */
  @Encode.uint16
  get searchRange(): number {
    return 2 * 2 ** Math.floor(Math.log2(this.segCountX2 / 2));
  }
  /** Log2 of the maximum power of 2 less than or equal to segCount (log2(searchRange/2), which is equal to floor(log2(segCount))) */
  @Encode.uint16
  get entrySelector(): number {
    return Math.floor(Math.log2(this.segCountX2 / 2));
  }
  /** segCount times 2, minus searchRange ((segCount * 2) - searchRange) */
  @Encode.uint16
  get rangeShift(): number {
    return this.segCountX2 - this.searchRange;
  }
  /** End characterCode for each segment, last=0xFFFF. */
  @Encode.numarray(2)
  endCode: number[] = [];
  /** Set to 0. */
  @Encode.uint16
  readonly reservedPad: number = 0;
  /** Start character code for each segment. */
  @Encode.numarray(2)
  startCode: number[] = [];
  /** Delta for all character codes in segment. */
  @Encode.numarray(2, true)
  idDelta: number[] = [];
  /** Offsets into glyphIdArray or 0 */
  @Encode.numarray(2)
  idRangeOffset: number[] = [];
  /** Glyph index array (arbitrary length) */
  @Encode.numarray(2, true)
  glyphIdArray: number[] = [];
  constructor(mapping: CharacterMap[] = []) {
    super(4);
    this.update(mapping);
  }

  update(mapping: CharacterMap[]) {
    this.startCode = [];
    this.endCode = [];
    this.idDelta = [];
    this.idRangeOffset = [];
    this.glyphIdArray = [];
    const sorted = mapping.toSorted((a, b) => a.code - b.code);
    const segments = findContinuousSegments(sorted);
    const segCount = segments.length + 1;
    this.segCountX2 = segCount * 2;
    for (const { startCode, endCode, glyphIds } of segments) {
      this.startCode.push(startCode);
      this.endCode.push(endCode);
      if (isGraphIdContinuous(glyphIds)) {
        this.idDelta.push(glyphIds[0] - startCode);
        this.idRangeOffset.push(0);
      } else {
        this.idDelta.push(0);
        this.idRangeOffset.push(
          2 * (segCount - this.idRangeOffset.length + this.glyphIdArray.length)
        );
        this.glyphIdArray.push(...glyphIds.map((x) => x - startCode));
      }
    }
    this.startCode.push(0xff_ff);
    this.endCode.push(0xff_ff);
    this.idDelta.push(1);
    this.idRangeOffset.push(0);
  }
}

function findContinuousSegments(sorted: CharacterMap[]) {
  const ret: { startCode: number; endCode: number; glyphIds: number[] }[] = [];
  let last = ret[0];
  for (const item of sorted) {
    if (last && last.endCode + 1 === item.code) {
      last.endCode = item.code;
      last.glyphIds.push(item.glyphId);
    } else {
      last = {
        startCode: item.code,
        endCode: item.code,
        glyphIds: [item.glyphId],
      };
      ret.push(last);
    }
  }
  return ret;
}

function isGraphIdContinuous(glyphIds: number[]): boolean {
  for (let i = 0; i < glyphIds.length - 1; i++) {
    if (glyphIds[i + 1] - glyphIds[i] !== 1) return false;
  }
  return true;
}

export class cmap_subtable_format6 extends SubTable16 {
  @Encode.uint16
  readonly language: number = 0;
  /** First character code of subrange. */
  @Encode.uint16
  firstCode: number = 0;
  /** Number of character codes in subrange. */
  @Encode.uint16
  get entryCount() {
    return this.glyphIdArray.length;
  }
  /** Array of glyph index values for character codes in the range. */
  @Encode.TypedArray
  glyphIdArray: Uint16Array;
  constructor(glyphIds: number[]) {
    super(6);
    this.glyphIdArray = new Uint16Array(glyphIds);
  }
}

export class SequentialMapGroup {
  /** Last character code in this group */
  @Encode.uint32
  startCharCode: number;
  /** Last character code in this group */
  @Encode.uint32
  endCharCode: number;
  /** Glyph index corresponding to the starting character code */
  @Encode.uint32
  startGlyphID: number;
  constructor(
    startCharCode: number,
    endCharCode: number,
    startGlyphID: number
  ) {
    this.startCharCode = startCharCode;
    this.endCharCode = endCharCode;
    this.startGlyphID = startGlyphID;
  }
}

export class cmap_subtable_format12 extends SubTable32 {
  @Encode.uint32
  readonly language: number = 0;
  /** Number of groupings which follow */
  @Encode.uint32
  get numGroups() {
    return this.groups.length;
  }
  /** Array of SequentialMapGroup records. */
  @Encode.array(SequentialMapGroup)
  groups: SequentialMapGroup[] = [];
  constructor(groups: SequentialMapGroup[]) {
    super(12);
    this.groups = groups;
  }
}

class SubTableWithEncoding {
  constructor(
    public platformID: PlatformID,
    public encodingID: UnicodeEncodingID | WindowsEncodingID,
    public subtable: SubTable16 | SubTable32
  ) {}
}

/** 'cmap' Table
 * -------------
 * New fonts should use Unicode encoding:
 * * If the font supports only characters in the Unicode Basic Multilingual Plane (U+0000 to U+FFFF): either platform 3, encoding 1; or platform 0, encoding 3. With either encoding, use a format 4 subtable.
 * * If the font supports any characters in a Unicode supplementary plane (U+10000 to U+10FFFF): either platform 3, encoding 10; or platform 0, encoding 4. With either encoding, use a format 12 subtable.
 * * If the font supports Unicode variation sequences: platform 0, encoding 5, with a format 14 subtable. This is in addition to a format 4 or format 12 subtable with encodings as listed above.
 * * If the font is designed as a font of last resort, using single glyphs for entire Unicode character ranges: platform 0, encoding 6, with a format 13 subtable. A last-resort font should not use any other encodings or subtable formats.
 *
 * When creating a font to support Unicode supplementary-plane characters, a format 4 subtable can be included, as well as a format 12 subtable, to provide compatibility with older applications might not support a format 12 subtable. This is not required, however. If both are included, either subtable may be used in different contexts, and so the glyph mappings for characters in the range U+0000 to U+FFFF should be identical. The format 12 table should include all BMP and supplementary-plane characters supported by the font. For each subtable, use the encodings indicated above.
 */
export default abstract class cmap {
  @Encode.uint16
  version: number = 0;
  /** Number of encoding tables that follow. */
  abstract readonly numTables: number;

  abstract readonly encodingRecords: EncodingRecord[];

  abstract readonly subtables: (SubTable16 | SubTable32)[];
}

export class cmapStd extends cmap {
  /** Number of encoding tables that follow. */
  @Encode.uint16
  get numTables() {
    return this.#data.length;
  }
  @Encode.array(EncodingRecord)
  get encodingRecords(): EncodingRecord[] {
    const result: EncodingRecord[] = [];
    let offset = 4 + 8 * this.#data.length;
    for (const { platformID, encodingID, subtable } of this.#data) {
      result.push(new EncodingRecord(platformID, encodingID, offset));
      offset += sizeof(subtable);
    }
    return result;
  }
  @Encode.dynarray()
  get subtables() {
    return this.#data.map(({ subtable }) => subtable);
  }

  #data: SubTableWithEncoding[] = [];
  addSubTable<T extends SubTable16 | SubTable32>(
    platformID: PlatformID,
    encodingID: UnicodeEncodingID | WindowsEncodingID,
    subtable: T
  ) {
    this.#data.push(new SubTableWithEncoding(platformID, encodingID, subtable));
    return subtable;
  }
}

export class cmapBmp extends cmap {
  @Encode.uint16
  readonly numTables: number = 2;
  @Encode.array(EncodingRecord)
  readonly encodingRecords: EncodingRecord[] = [
    new EncodingRecord(
      PlatformID.Unicode,
      UnicodeEncodingID.Unicode2_0_BMP,
      20
    ),
    new EncodingRecord(PlatformID.Windows, WindowsEncodingID.UnicodeBMP, 20),
  ];
  @Encode.dynarray()
  readonly subtables: (SubTable16 | SubTable32)[];
  constructor(table: cmap_subtable_format4) {
    super();
    this.subtables = [table];
  }
}
