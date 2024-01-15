import { Encode, offsetof, sizeof } from "../encoder";
import { Fixupable } from "../encoder/basetype";
import { XMap } from "../utils/xmap";

export class TagRecord {
  @Encode.Tag
  tag: string;
  @Encode.Offset16
  offset: number;
  constructor(tag: string, offset: number) {
    this.tag = tag;
    this.offset = offset;
  }
}

export class TagRecordList<T> extends XMap<string, T> {
  readonly #base: number;
  constructor(base: number = 0) {
    super();
    this.#base = base;
  }
  @Encode.uint16
  get count() {
    return this.length;
  }
  @Encode.array(TagRecord)
  get list() {
    let offset = this.#base + 2 + 6 * this.count;
    return this.sortedEntries.map(([tag, obj]) => {
      const res = new TagRecord(tag, offset);
      offset += sizeof(obj);
      return res;
    });
  }
  @Encode.dynarray()
  get payload(): T[] {
    return this.sortedValues;
  }
  addWithIdx(tag: string, obj: T) {
    const idx = this.length;
    this.add(tag, obj);
    return [obj, idx] as const;
  }
}

export function arrayToOffsets<T>(
  input: T[],
  offset: number,
  base: number = 2
): number[] {
  offset += base * input.length;
  return input.map((item) => {
    const res = offset;
    offset += sizeof(item);
    return res;
  });
}

// export class ScriptRecord {
//   @Encode.Tag
//   scriptTag: string = "DFLT";
//   /** Offset to Script table, from beginning of ScriptList */
//   @Encode.Offset16
//   scriptOffset: number = 0;
// }

// export class ScriptList {
//   /** Number of ScriptRecords */
//   @Encode.uint16
//   get scriptCount() {
//     return this, this.scriptRecords.length;
//   }
//   /** Array of ScriptRecords, listed alphabetically by script tag */
//   @Encode.array(CommonTagRecord)
//   scriptRecords: CommonTagRecord[] = [];
// }

// export class LangSysRecord {
//   @Encode.Tag
//   langSysTag: string = "dflt";
//   /** Offset to LangSys table, from beginning of Script table */
//   @Encode.Offset16
//   langSysOffset: number = 0;
// }

export class Script extends Fixupable {
  /** Offset to default LangSys table, from beginning of Script table — may be NULL */
  @Encode.Offset16
  defaultLangSysOffset: number = 0;
  @Encode.typed(TagRecordList)
  langSysList = new TagRecordList<LangSys>(2);
  fixup(): void {
    const dflt = this.langSysList.list.find((x) => x.tag === "dflt");
    if (dflt) {
      this.defaultLangSysOffset = dflt.offset;
    }
  }
  // /** Number of LangSysRecords for this script — excluding the default LangSys */
  // @Encode.uint16
  // get langSysCount() {
  //   return this.langSysRecords.length;
  // }
  // /** Array of LangSysRecords, listed alphabetically by LangSys tag */
  // @Encode.array(CommonTagRecord)
  // langSysRecords: CommonTagRecord[] = [];
}

export class LangSys {
  /** = NULL (reserved for an offset to a reordering table) */
  @Encode.Offset16
  readonly lookupOrderOffset: number = 0;
  /** Index of a feature required for this language system; if no required features = 0xFFFF */
  @Encode.uint16
  requiredFeatureIndex = 0xff_ff;
  /** Number of feature index values for this language system — excludes the required feature */
  @Encode.uint16
  get featureIndexCount() {
    return this.featureIndices.length;
  }
  /** Array of indices into the FeatureList, in arbitrary order */
  @Encode.numarray(2)
  featureIndices: number[] = [];
}

export class FeatureRecord {
  @Encode.Tag
  featureTag: string;
  /** Offset to Feature table, from beginning of FeatureList */
  @Encode.Offset16
  featureOffset: number;
  constructor(tag: string, offset: number) {
    this.featureTag = tag;
    this.featureOffset = offset;
  }
}

export class Feature {
  /** Offset from start of Feature table to FeatureParams table, if defined for the feature and present, else NULL */
  @Encode.Offset16
  get featureParamsOffset(): number {
    if (this.featureParams) {
      return offsetof(this, "featureParams");
    }
    return 0;
  }
  /** Number of LookupList indices for this feature */
  @Encode.uint16
  get lookupIndexCount() {
    return this.lookupListIndices.length;
  }
  /** Array of indices into the LookupList — zero-based (first lookup is LookupListIndex = 0) */
  @Encode.numarray(2)
  lookupListIndices: number[] = [];
  @Encode.nullable()
  featureParams: any;
  constructor(lookupListIndices: number[] = [], featureParams: any = null) {
    this.lookupListIndices = lookupListIndices;
    this.featureParams = featureParams;
  }
}

export class FeatureList {
  #data: [string, Feature][] = [];
  /** Number of FeatureRecords in this table */
  @Encode.uint16
  get featureCount() {
    return this.#data.length;
  }
  /** Array of FeatureRecords — zero-based (first feature has FeatureIndex = 0), listed alphabetically by feature tag */
  @Encode.array(FeatureRecord)
  get featureRecords(): FeatureRecord[] {
    let offset = 2 + 6 * this.featureCount;
    return this.#data.map(([tag, feature]) => {
      const ret = new FeatureRecord(tag, offset);
      offset += sizeof(feature);
      return ret;
    });
  }
  @Encode.array(Feature)
  get features(): Feature[] {
    return this.#data.map((x) => x[1]);
  }
  add(name: string, feature: Feature) {
    return this.#data.push([name, feature]) - 1;
  }
}

export enum LookupFlag {
  /** This bit relates only to the correct processing of the cursive attachment lookup type (GPOS lookup type 3). When this bit is set, the last glyph in a given sequence to which the cursive attachment lookup is applied, will be positioned on the baseline. */
  RIGHT_TO_LEFT = 0x00_01,
  /** If set, skips over base glyphs */
  IGNORE_BASE_GLYPHS = 0x00_02,
  /** If set, skips over ligatures */
  IGNORE_LIGATURES = 0x00_04,
  /** If set, skips over all combining marks */
  IGNORE_MARKS = 0x00_08,
  /** If set, indicates that the lookup table structure is followed by a MarkFilteringSet field. The layout engine skips over all mark glyphs not in the mark filtering set indicated. */
  USE_MARK_FILTERING_SET = 0x00_10,
  /** If not zero, skips over all marks of attachment type different from specified. */
  MARK_ATTACHMENT_TYPE_MASK = 0xff_00,
}

export class Lookup {
  /** Different enumerations for GSUB and GPOS */
  @Encode.uint16
  readonly lookupType: number;
  /** Lookup qualifiers */
  @Encode.uint16
  lookupFlag: number = 0;
  /** Number of subtables for this lookup */
  @Encode.uint16
  get subTableCount() {
    return this.subtables.length;
  }
  /** Array of offsets to lookup subtables, from beginning of Lookup table */
  @Encode.numarray(2)
  get subtableOffsets(): number[] {
    return arrayToOffsets(this.subtables, 8);
  }
  /** Index (base 0) into GDEF mark glyph sets structure. This field is only present if the USE_MARK_FILTERING_SET lookup flag is set. */
  @Encode.uint16
  markFilteringSet: number = 0;
  @Encode.dynarray()
  subtables: any[] = [];
  constructor(lookupType: number) {
    this.lookupType = lookupType;
  }
}

export class LookupList {
  /** Number of lookups in this table */
  @Encode.uint16
  get lookupCount() {
    return this.lookups.length;
  }
  /** Array of offsets to Lookup tables, from beginning of LookupList — zero based (first lookup is Lookup index = 0) */
  @Encode.numarray(2)
  get lookupOffsets(): number[] {
    return arrayToOffsets(this.lookups, 2);
  }
  @Encode.array(Lookup)
  lookups: Lookup[] = [];
  addLookup(type: number, initLookup: (table: Lookup) => void) {
    const table = new Lookup(type);
    initLookup(table);
    return this.lookups.push(table) - 1;
  }
}

export type Coverage = CoverageFormat1 | CoverageFormat2;

export class CoverageFormat1 {
  /** Format identifier — format = 1 */
  @Encode.uint16
  readonly coverageFormat = 1;
  /** Number of glyphs in the glyph array */
  @Encode.uint16
  get glyphCount() {
    return this.glyphArray.length;
  }
  /** 	Array of glyph IDs — in numerical order */
  @Encode.numarray(2)
  glyphArray: number[];
  constructor(glyphArray: number[] = []) {
    this.glyphArray = glyphArray;
  }
}

export class RangeRecord {
  /** First glyph ID in the range */
  @Encode.uint16
  startGlyphID: number = 0;
  /** Last glyph ID in the range */
  @Encode.uint16
  endGlyphID: number = 0;
  /** Coverage Index of first glyph ID in range */
  @Encode.uint16
  startCoverageIndex: number = 0;
}

export class CoverageFormat2 {
  /** Format identifier — format = 2 */
  @Encode.uint16
  readonly coverageFormat = 2;
  /** Number of RangeRecords */
  @Encode.uint16
  get rangeCount() {
    return this.rangeRecords.length;
  }
  /** Array of glyph ranges — ordered by startGlyphID. */
  @Encode.array(RangeRecord)
  rangeRecords: RangeRecord[] = [];
}

export class ClassDefFormat1 {
  /** Format identifier — format = 1 */
  @Encode.uint16
  readonly classFormat: number = 1;
  /** First glyph ID of the classValueArray */
  @Encode.uint16
  startGlyphID: number = 0;
  /** Size of the classValueArray */
  @Encode.uint16
  get glyphCount() {
    return this.classValueArray.length;
  }
  /** Array of Class Values — one per glyph ID */
  @Encode.numarray(2)
  classValueArray: number[] = [];
}

export class ClassRangeRecord {
  /** First glyph ID in the range */
  @Encode.uint16
  startGlyphID: number = 0;
  /** Last glyph ID in the range */
  @Encode.uint16
  endGlyphID: number = 0;
  /** Applied to all glyphs in the range */
  @Encode.uint16
  class: number = 0;
}

export class ClassDefFormat2 {
  /** Format identifier — format = 2 */
  @Encode.uint16
  readonly classFormat: number = 2;
  /** Number of ClassRangeRecords */
  @Encode.uint16
  get classRangeCount() {
    return this.classRangeRecords.length;
  }
  /** Array of ClassRangeRecords — ordered by startGlyphID */
  @Encode.array(ClassRangeRecord)
  classRangeRecords: ClassRangeRecord[] = [];
}

export class SequenceLookupRecord {
  /** Index (zero-based) into the input glyph sequence */
  @Encode.uint16
  sequenceIndex: number = 0;
  /** Index (zero-based) into the LookupList */
  @Encode.uint16
  lookupListIndex: number = 0;
}

export class SequenceRule {
  /** Number of glyphs in the input glyph sequence */
  @Encode.uint16
  get glyphCount() {
    return this.inputSequence.length + 1;
  }
  /** Number of SequenceLookupRecords */
  @Encode.uint16
  get seqLookupCount() {
    return this.seqLookupRecords.length;
  }
  /** Array of input glyph IDs—starting with the second glyph */
  @Encode.numarray(2)
  inputSequence: number[] = [];
  /** Array of Sequence lookup records */
  @Encode.array(SequenceLookupRecord)
  seqLookupRecords: SequenceLookupRecord[] = [];
}

export class SequenceRuleSet {
  /** Number of SequenceRule tables */
  @Encode.uint16
  get seqRuleCount() {
    return this.seqRuleOffsets.length;
  }
  /** Array of offsets to SequenceRule tables, from beginning of the SequenceRuleSet table */
  @Encode.numarray(2)
  get seqRuleOffsets(): number[] {
    return arrayToOffsets(this.seqRules, 2);
  }
  @Encode.array(SequenceRule)
  seqRules: SequenceRule[] = [];
}

export class SequenceContextFormat1 {
  /** Format identifier — format = 1 */
  @Encode.uint16
  readonly format: number = 1;
  /** Offset to Coverage table, from beginning of SequenceContextFormat1 table */
  @Encode.Offset16
  coverageOffset: number = 0;
  /** Number of SequenceRuleSet tables */
  @Encode.uint16
  get seqRuleSetCount() {
    return this.seqRuleSets.length;
  }
  /** Array of offsets to SequenceRuleSet tables, from beginning of SequenceContextFormat1 table (offsets may be NULL) */
  @Encode.numarray(2)
  get seqRuleSetOffsets(): number[] {
    return arrayToOffsets(this.seqRuleSets, 6);
  }
  @Encode.array(SequenceRuleSet)
  seqRuleSets: SequenceRuleSet[] = [];
}

export class ClassSequenceRule {
  /** Number of glyphs to be matched */
  @Encode.uint16
  get glyphCount() {
    return this.inputSequence.length + 1;
  }
  /** Number of SequenceLookupRecords */
  @Encode.uint16
  get seqLookupCount() {
    return this.seqLookupRecords.length;
  }
  /** Sequence of classes to be matched to the input glyph sequence, beginning with the second glyph position */
  @Encode.numarray(2)
  inputSequence: number[] = [];
  /** Array of SequenceLookupRecords */
  @Encode.array(SequenceLookupRecord)
  seqLookupRecords: SequenceLookupRecord[] = [];
}

export class ClassSequenceRuleSet {
  /** Number of ClassSequenceRule tables */
  @Encode.uint16
  get classSeqRuleCount() {
    return this.classSeqRules.length;
  }
  /** Array of offsets to ClassSequenceRule tables, from beginning of ClassSequenceRuleSet table */
  @Encode.numarray(2)
  get classSeqRuleOffsets(): number[] {
    return arrayToOffsets(this.classSeqRules, 2);
  }
  @Encode.array(ClassSequenceRule)
  classSeqRules: ClassSequenceRule[] = [];
}

export class SequenceContextFormat2 {
  /** Format identifier — format = 2 */
  @Encode.uint16
  readonly format: number = 2;
  /** Offset to Coverage table, from beginning of SequenceContextFormat2 table */
  @Encode.Offset16
  coverageOffset: number = 0;
  /** Offset to ClassDef table, from beginning of SequenceContextFormat2 table */
  @Encode.Offset16
  classDefOffset: number = 0;
  /** Number of ClassSequenceRuleSet tables */
  @Encode.uint16
  get classSeqRuleSetCount() {
    return this.classSeqRuleSets.length;
  }
  /** Array of offsets to ClassSequenceRuleSet tables, from beginning of SequenceContextFormat2 table (may be NULL) */
  @Encode.numarray(2)
  get classSeqRuleSetOffsets(): number[] {
    return arrayToOffsets(this.classSeqRuleSets, 8);
  }
  @Encode.array(ClassSequenceRuleSet)
  classSeqRuleSets: ClassSequenceRuleSet[] = [];
}

export class SequenceContextFormat3 {
  /** Format identifier — format = 3 */
  @Encode.uint16
  readonly format: number = 3;
  /** Number of glyphs in the input sequence */
  @Encode.uint16
  get glyphCount() {
    return this.coverageOffsets.length;
  }
  /** Number of SequenceLookupRecords */
  @Encode.uint16
  get seqLookupCount() {
    return this.seqLookupRecords.length;
  }
  /** Array of offsets to Coverage tables, from beginning of SequenceContextFormat3 subtable */
  @Encode.numarray(2)
  coverageOffsets: number[] = [];
  /** Array of SequenceLookupRecords */
  @Encode.array(SequenceLookupRecord)
  seqLookupRecords: SequenceLookupRecord[] = [];
}

export class ChainedSequenceContextFormat1 {
  /** Format identifier — format = 1 */
  @Encode.uint16
  readonly format: number = 1;
  /** Offset to Coverage table, from beginning of ChainSequenceContextFormat1 table */
  @Encode.Offset16
  coverageOffset: number = 0;
  /** Number of ChainedSequenceRuleSet tables */
  @Encode.uint16
  get chainedSeqRuleSetCount() {
    return this.chainedSeqRuleSetOffsets.length;
  }
  /** Array of offsets to ChainedSeqRuleSet tables, from beginning of ChainedSequenceContextFormat1 table (may be NULL) */
  @Encode.numarray(2)
  chainedSeqRuleSetOffsets: number[] = [];
}

export class ChainedSequenceRuleSet {
  /** Number of ChainedSequenceRule tables */
  @Encode.uint16
  get chainedSeqRuleCount() {
    return this.chainedSeqRuleOffsets.length;
  }
  /** Array of offsets to ChainedSequenceRule tables, from beginning of the ChainedSequenceRuleSet table */
  @Encode.numarray(2)
  chainedSeqRuleOffsets: number[] = [];
}

export class ChainedSequenceRule {
  /** Number of glyphs in the backtrack sequence */
  @Encode.uint16
  get backtrackGlyphCount() {
    return this.backtrackSequence.length;
  }
  /** Array of backtrack glyph IDs */
  @Encode.numarray(2)
  backtrackSequence: number[] = [];
  /** Number of glyphs in the input sequence */
  @Encode.uint16
  get inputGlyphCount() {
    return this.inputSequence.length + 1;
  }
  /** Array of input glyph IDs—start with second glyph */
  @Encode.numarray(2)
  inputSequence: number[] = [];
  /** Number of glyphs in the lookahead sequence */
  @Encode.uint16
  get lookaheadGlyphCount() {
    return this.lookaheadSequence.length;
  }
  /** Array of lookahead glyph IDs */
  @Encode.numarray(2)
  lookaheadSequence: number[] = [];
  /** Number of SequenceLookupRecords */
  @Encode.uint16
  get seqLookupCount() {
    return this.seqLookupRecords.length;
  }
  /** Array of SequenceLookupRecords */
  @Encode.array(SequenceLookupRecord)
  seqLookupRecords: SequenceLookupRecord[] = [];
}

export class ChainedSequenceContextFormat2 {
  /** Format identifier — format = 2 */
  @Encode.uint16
  readonly format: number = 2;
  /** Offset to Coverage table, from beginning of SequenceContextFormat2 table */
  @Encode.Offset16
  coverageOffset: number = 0;
  /** Offset to ClassDef table containing backtrack sequence context, from beginning of ChainedSequenceContextFormat2 table */
  @Encode.Offset16
  backtrackClassDefOffset: number = 0;
  /** Offset to ClassDef table containing input sequence context, from beginning of ChainedSequenceContextFormat2 table */
  @Encode.Offset16
  inputClassDefOffset: number = 0;
  /** Offset to ClassDef table containing lookahead sequence context, from beginning of ChainedSequenceContextFormat2 table */
  @Encode.Offset16
  lookaheadClassDefOffset: number = 0;
  /** Number of ChainedClassSequenceRuleSet tables */
  @Encode.Offset16
  get chainedClassSeqRuleSetCount() {
    return this.chainedClassSeqRuleSetOffsets.length;
  }
  /** Array of offsets to ChainedClassSequenceRuleSet tables, from beginning of ChainedSequenceContextFormat2 table (may be NULL) */
  @Encode.Offset16
  chainedClassSeqRuleSetOffsets: number[] = [];
}

export class ChainedClassSequenceRuleSet {
  /** Number of ChainedClassSequenceRule tables */
  @Encode.uint16
  get chainedClassSeqRuleCount() {
    return this.chainedClassSeqRuleOffsets.length;
  }
  /** Array of offsets to ChainedClassSequenceRule tables, from beginning of ChainedClassSequenceRuleSet */
  @Encode.numarray(2)
  chainedClassSeqRuleOffsets: number[] = [];
}

export class ChainedClassSequenceRule {
  /** Number of glyphs in the backtrack sequence */
  @Encode.uint16
  get backtrackGlyphCount() {
    return this.backtrackSequence.length;
  }
  /** Array of backtrack-sequence classes */
  @Encode.numarray(2)
  backtrackSequence: number[] = [];
  /** Total number of glyphs in the input sequence */
  @Encode.uint16
  get inputGlyphCount() {
    return this.inputSequence.length + 1;
  }
  /** Array of input sequence classes, beginning with the second glyph position */
  @Encode.numarray(2)
  inputSequence: number[] = [];
  /** Number of glyphs in the lookahead sequence */
  @Encode.uint16
  get lookaheadGlyphCount() {
    return this.lookaheadSequence.length;
  }
  /** Array of lookahead-sequence classes */
  @Encode.numarray(2)
  lookaheadSequence: number[] = [];
  /** Number of SequenceLookupRecords */
  @Encode.uint16
  get seqLookupCount() {
    return this.seqLookupRecords.length;
  }
  /** Array of SequenceLookupRecords */
  @Encode.array(SequenceLookupRecord)
  seqLookupRecords: SequenceLookupRecord[] = [];
}

export class ChainedSequenceContextFormat3 {
  /** Format identifier — format = 3 */
  @Encode.uint16
  readonly format: number = 3;
  /** Number of glyphs in the backtrack sequence */
  @Encode.uint16
  get backtrackGlyphCount() {
    return this.backtrackSequence.length;
  }
  /** Array of backtrack-sequence classes */
  @Encode.numarray(2)
  backtrackSequence: number[] = [];
  /** Number of glyphs in the input sequence */
  @Encode.uint16
  get inputGlyphCount() {
    return this.inputSequence.length;
  }
  /** Array of offsets to coverage tables for the input sequence */
  @Encode.numarray(2)
  inputSequence: number[] = [];
  /** Number of glyphs in the lookahead sequence */
  @Encode.uint16
  get lookaheadGlyphCount() {
    return this.lookaheadSequence.length;
  }
  /** Array of offsets to coverage tables for the lookahead sequence */
  @Encode.numarray(2)
  lookaheadSequence: number[] = [];
  /** Number of SequenceLookupRecords */
  @Encode.uint16
  get seqLookupCount() {
    return this.seqLookupRecords.length;
  }
  /** Array of SequenceLookupRecords */
  @Encode.array(SequenceLookupRecord)
  seqLookupRecords: SequenceLookupRecord[] = [];
}

export enum DeltaFormat {
  NONE = 0,
  /** Signed 2-bit value, 8 values per uint16 */
  LOCAL_2_BIT_DELTAS = 0x00_01,
  /** Signed 4-bit value, 4 values per uint16 */
  LOCAL_4_BIT_DELTAS = 0x00_02,
  /** Signed 8-bit value, 2 values per uint16 */
  LOCAL_8_BIT_DELTAS = 0x00_03,
  /** VariationIndex table, contains a delta-set index pair. */
  VARIATION_INDEX = 0x80_00,
}

export class Device {
  /** Smallest size to correct, in ppem */
  @Encode.uint16
  startSize: number = 0;
  /** Largest size to correct, in ppem */
  @Encode.uint16
  endSize: number = 0;
  /** Format of deltaValue array data: 0x0001, 0x0002, or 0x0003 */
  @Encode.uint16
  deltaFormat: 1 | 2 | 3 = 1;
  /** Array of compressed data */
  @Encode.numarray(2)
  deltaValue: number[] = [];
}

export class VariationIndex {
  /** A delta-set outer index — used to select an item variation data subtable within the item variation store. */
  deltaSetOuterIndex: number = 0;
  /** A delta-set inner index — used to select a delta-set row within an item variation data subtable. */
  deltaSetInnerIndex: number = 0;
  /** Format, = 0x8000 */
  readonly deltaFormat: 0x80_00 = 0x80_00;
}

export class ConditionFormat1 {
  /** Format identifier — format = 1 */
  @Encode.uint16
  readonly format: number = 1;
  /** Index (zero-based) for the variation axis within the 'fvar' table. */
  @Encode.uint16
  axisIndex: number = 0;
  /** Minimum value of the font variation instances that satisfy this condition. */
  @Encode.F2DOT14
  filterRangeMinValue: number = 0;
  /** Maximum value of the font variation instances that satisfy this condition. */
  @Encode.F2DOT14
  filterRangeMaxValue: number = 0;
}

export class ConditionSet {
  /** Number of conditions for this condition set. */
  @Encode.uint16
  get conditionCount() {
    return this.data.length;
  }
  /** Array of offsets to condition tables, from beginning of the ConditionSet table. */
  @Encode.numarray(4)
  get conditionOffsets(): number[] {
    return arrayToOffsets(this.data, 2, 4);
  }
  @Encode.typed(ConditionFormat1)
  data: ConditionFormat1[] = [];
}

export class FeatureTableSubstitutionRecord {
  /** The feature table index to match. */
  @Encode.uint16
  featureIndex: number;
  /** Offset to an alternate feature table, from start of the FeatureTableSubstitution table. */
  @Encode.Offset32
  alternateFeatureOffset: number;
  constructor(featureIndex: number, alternateFeatureOffset: number) {
    this.featureIndex = featureIndex;
    this.alternateFeatureOffset = alternateFeatureOffset;
  }
}

export class FeatureTableSubstitution extends XMap<number, Feature> {
  @Encode.Version16Dot16
  readonly version: [number, number] = [1, 0];
  /** Number of feature table substitution records. */
  @Encode.uint16
  get substitutionCount() {
    return this.length;
  }
  /** Array of feature table substitution records. */
  @Encode.array(FeatureTableSubstitutionRecord)
  get substitutions(): FeatureTableSubstitutionRecord[] {
    let offset = 6 + 6 * this.substitutionCount;
    return this.sortedEntries.map(([featureIndex, feature]) => {
      const ret = new FeatureTableSubstitutionRecord(+featureIndex, offset);
      offset += sizeof(feature);
      return ret;
    });
  }
  @Encode.array(Feature)
  get features(): Feature[] {
    return this.sortedValues;
  }
}

export class FeatureVariationRecord {
  /** Offset to a condition set table, from beginning of FeatureVariations table. */
  @Encode.Offset32
  conditionSetOffset: number;
  /** Offset to a feature table substitution table, from beginning of the FeatureVariations table. */
  @Encode.Offset32
  featureTableSubstitutionOffset: number;
  constructor(
    conditionSetOffset: number,
    featureTableSubstitutionOffset: number
  ) {
    this.conditionSetOffset = conditionSetOffset;
    this.featureTableSubstitutionOffset = featureTableSubstitutionOffset;
  }
}

class FeatureTableSubstitutionWithConditionSetPack {
  @Encode.typed(ConditionSet)
  conditionSet: ConditionSet;
  @Encode.typed(FeatureTableSubstitution)
  featureTableSubstitution: FeatureTableSubstitution;
  constructor(
    conditionSet: ConditionSet,
    featureTableSubstitution: FeatureTableSubstitution
  ) {
    this.conditionSet = conditionSet;
    this.featureTableSubstitution = featureTableSubstitution;
  }
}

export class FeatureVariations {
  @Encode.Version16Dot16
  readonly version: [number, number] = [1, 0];
  /** Number of feature variation records. */
  @Encode.uint32
  get featureVariationRecordCount() {
    return this.data.length;
  }
  /** Array of feature variation records. */
  @Encode.array(FeatureVariationRecord)
  get featureVariationRecords(): FeatureVariationRecord[] {
    let offset = 8 + 8 * this.featureVariationRecordCount;
    return this.data.map(({ conditionSet, featureTableSubstitution }) => {
      const conditionSetSize = sizeof(conditionSet);
      const res = new FeatureVariationRecord(offset, offset + conditionSetSize);
      offset += conditionSetSize + sizeof(featureTableSubstitution);
      return res;
    });
  }
  @Encode.array(FeatureTableSubstitutionWithConditionSetPack)
  data: FeatureTableSubstitutionWithConditionSetPack[] = [];
}
