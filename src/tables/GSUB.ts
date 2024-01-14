import { Encode, offsetof, sizeof } from "../encoder";
import {
  FeatureList,
  FeatureVariations,
  LookupList,
  Script,
  TagRecordList,
  arrayToOffsets,
  type Coverage,
} from "./common";

export default abstract class GSUB {
  @Encode.Version16Dot16
  version: [number, number];
  constructor(version: [number, number]) {
    this.version = version;
  }
}

export class GSUBv0 extends GSUB {
  @Encode.Offset16
  get scriptListOffset() {
    return offsetof(this, "scriptList");
  }
  @Encode.Offset16
  get featureListOffset() {
    return offsetof(this, "featureList");
  }
  @Encode.Offset16
  get lookupListOffset() {
    return offsetof(this, "lookupList");
  }
  constructor() {
    super([1, 0]);
  }
  @Encode.typed(TagRecordList)
  scriptList: TagRecordList<Script> = new TagRecordList();
  @Encode.typed(FeatureList)
  featureList: FeatureList = new FeatureList();
  @Encode.typed(LookupList)
  lookupList: LookupList = new LookupList();
}

export class GSUBv1 extends GSUB {
  @Encode.Offset16
  get scriptListOffset() {
    return offsetof(this, "scriptList");
  }
  @Encode.Offset16
  get featureListOffset() {
    return offsetof(this, "featureList");
  }
  @Encode.Offset16
  get lookupListOffset() {
    return offsetof(this, "lookupList");
  }
  @Encode.Offset32
  get featureVariationsOffset() {
    return offsetof(this, "featureVariantions");
  }
  constructor() {
    super([1, 1]);
  }
  @Encode.typed(TagRecordList)
  scriptList: TagRecordList<Script> = new TagRecordList();
  @Encode.typed(FeatureList)
  featureList: FeatureList = new FeatureList();
  @Encode.typed(LookupList)
  lookupList: LookupList = new LookupList();
  @Encode.typed(FeatureVariations)
  featureVariantions: FeatureVariations = new FeatureVariations();
}

export class SingleSubst1 {
  @Encode.uint16
  substFormat: number = 1;
  @Encode.Offset16
  readonly coverageOffset: number = 6;
  @Encode.int16
  deltaGlyphID: number = 0;
  @Encode
  coverage: Coverage;
  constructor(coverage: Coverage) {
    this.coverage = coverage;
  }
}

export class SingleSubst2 {
  @Encode.uint16
  substFormat: number = 2;
  @Encode.Offset16
  get coverageOffset(): number {
    return offsetof(this, "coverage");
  }
  @Encode.uint16
  get glyphCount(): number {
    return this.substituteGlyphIDs.length;
  }
  @Encode.numarray(2)
  substituteGlyphIDs: number[] = [];
  @Encode
  coverage: Coverage;
  constructor(coverage: Coverage, substituteGlyphIDs: number[]) {
    this.coverage = coverage;
    this.substituteGlyphIDs = substituteGlyphIDs;
  }
}

export class MultipleSequence {
  @Encode.uint16
  get glyphCount(): number {
    return this.substituteGlyphIDs.length;
  }
  @Encode.numarray(2)
  substituteGlyphIDs: number[] = [];
}

export class MultipleSubst {
  @Encode.uint16
  substFormat: number = 1;
  @Encode.Offset16
  get coverageOffset(): number {
    return 6 + 2 * this.sequences.length;
  }
  @Encode.uint16
  get sequenceCount(): number {
    return this.sequences.length;
  }
  @Encode.numarray(2)
  get sequenceOffsets(): number[] {
    return arrayToOffsets(this.sequences, 6 + sizeof(this.coverage));
  }
  @Encode
  coverage: Coverage;
  @Encode.array(MultipleSequence)
  sequences: MultipleSequence[] = [];
  constructor(coverage: Coverage, sequences: MultipleSequence[]) {
    this.coverage = coverage;
    this.sequences = sequences;
  }
}

export class AlternateSet {
  @Encode.uint16
  get glyphCount(): number {
    return this.alternateGlyphIDs.length;
  }
  @Encode.numarray(2)
  alternateGlyphIDs: number[] = [];
}

export class AlternateSubst {
  @Encode.uint16
  readonly substFormat: number = 1;
  @Encode.Offset16
  get coverageOffset(): number {
    return 6 + 2 * this.alternateSets.length;
  }
  @Encode.uint16
  get alternateSetCount(): number {
    return this.alternateSets.length;
  }
  @Encode.numarray(2)
  get alternateSetOffsets(): number[] {
    return arrayToOffsets(this.alternateSets, 6 + sizeof(this.coverage));
  }
  @Encode
  coverage: Coverage;
  @Encode.array(AlternateSet)
  alternateSets: AlternateSet[];
  constructor(coverage: Coverage, alternateSets: AlternateSet[]) {
    this.coverage = coverage;
    this.alternateSets = alternateSets;
  }
}

export class Ligature {
  @Encode.uint16
  ligatureGlyph: number;
  @Encode.uint16
  get componentCount(): number {
    return this.componentGlyphIDs.length + 1;
  }
  @Encode.numarray(2)
  componentGlyphIDs: number[];
  constructor(componentGlyphIDs: number[], ligatureGlyph: number) {
    this.componentGlyphIDs = componentGlyphIDs;
    this.ligatureGlyph = ligatureGlyph;
  }
}

export class LigatureSet {
  @Encode.uint16
  get ligatureCount(): number {
    return this.ligatureOffsets.length;
  }
  @Encode.numarray(2)
  get ligatureOffsets(): number[] {
    return arrayToOffsets(this.ligatures, 2);
  }
  @Encode.array(Ligature)
  ligatures: Ligature[];
  constructor(ligatures: Ligature[]) {
    this.ligatures = ligatures;
  }
}

export class LigatureSubst {
  @Encode.uint16
  substFormat: number = 1;
  @Encode.Offset16
  get coverageOffset(): number {
    return 6 + 2 * this.ligatureSets.length;
  }
  @Encode.uint16
  get ligatureSetCount(): number {
    return this.ligatureSets.length;
  }
  @Encode.numarray(2)
  get ligatureSetOffsets(): number[] {
    return arrayToOffsets(this.ligatureSets, 6 + sizeof(this.coverage));
  }
  @Encode
  coverage: Coverage;
  @Encode.array(LigatureSet)
  ligatureSets: LigatureSet[];
  constructor(coverage: Coverage, ligatureSets: LigatureSet[]) {
    this.coverage = coverage;
    this.ligatureSets = ligatureSets;
  }
}
