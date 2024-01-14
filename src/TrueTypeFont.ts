import { MacintoshEncodingID } from "./enum/MacintoshEncodingID";
import { NameID } from "./enum/NameID";
import { PlatformID } from "./enum/PlatformID";
import { UnicodeEncodingID } from "./enum/UnicodeEncodingID";
import { WindowsEncodingID } from "./enum/WindowsEncodingID";
import Font from "./struct/Font";
import DSIG from "./tables/DSIG";
import OS_2 from "./tables/OS_2";
import type cmap from "./tables/cmap";
import glyf, { GlyphHeader } from "./tables/glyf";
import head from "./tables/head";
import hhea from "./tables/hhea";
import hmtx, { longHorMetric } from "./tables/hmtx";
import loca from "./tables/loca";
import maxp from "./tables/maxp";
import { name, type NameDef } from "./tables/name";
import post from "./tables/post";
import { aparray } from "./utils/aparray";

export { SimpleGlyphTable as SimpleGlyph } from "./tables/glyf";

export class TrueTypeFont extends Font {
  #head = new head();
  #hhea = new hhea();
  #hmtx = new hmtx();
  #OS_2 = new OS_2();
  #maxp = new maxp();
  #loca = new loca();
  #glyf = new glyf();
  #post = new post();
  #DSIG = new DSIG();
  constructor({
    unitsPerEm,
    FamilyName,
    SubfamilyName = "Regular",
    UniqueID,
    FullName = FamilyName + " " + SubfamilyName,
    Version,
    PostScriptName = `${FamilyName}-${SubfamilyName}`.replace(/ /g, "_"),
    extraNames = [],
  }: {
    unitsPerEm: number;
    FamilyName: string;
    SubfamilyName?: string;
    UniqueID: string;
    FullName?: string;
    Version: `Version ${number}.${number}${string}`;
    PostScriptName?: string;
    extraNames?: NameDef[];
  }) {
    super(0x00_01_00_00);
    this.#head.unitsPerEm = unitsPerEm;
    this.setTable("head", this.#head);
    this.setTable("hhea", this.#hhea);
    this.setTable("hmtx", this.#hmtx);
    this.setTable("OS/2", this.#OS_2);
    this.setTable(
      "name",
      new name([
        {
          platformID: PlatformID.Macintosh,
          encodingID: MacintoshEncodingID.Roman,
          name: FamilyName,
          nameID: NameID.FamilyName,
        },
        {
          platformID: PlatformID.Macintosh,
          encodingID: MacintoshEncodingID.Roman,
          name: SubfamilyName,
          nameID: NameID.SubfamilyName,
        },
        {
          platformID: PlatformID.Macintosh,
          encodingID: MacintoshEncodingID.Roman,
          name: FullName,
          nameID: NameID.FullName,
        },
        {
          platformID: PlatformID.Macintosh,
          encodingID: MacintoshEncodingID.Roman,
          name: Version,
          nameID: NameID.Version,
        },
        {
          platformID: PlatformID.Macintosh,
          encodingID: MacintoshEncodingID.Roman,
          name: PostScriptName,
          nameID: NameID.PostScriptName,
        },
        {
          platformID: PlatformID.Windows,
          encodingID: WindowsEncodingID.UnicodeBMP,
          languageID: 0x04_09,
          name: FamilyName,
          nameID: NameID.FamilyName,
        },
        {
          platformID: PlatformID.Windows,
          encodingID: WindowsEncodingID.UnicodeBMP,
          languageID: 0x04_09,
          name: SubfamilyName,
          nameID: NameID.SubfamilyName,
        },
        {
          platformID: PlatformID.Windows,
          encodingID: WindowsEncodingID.UnicodeBMP,
          languageID: 0x04_09,
          name: UniqueID,
          nameID: NameID.UniqueID,
        },
        {
          platformID: PlatformID.Windows,
          encodingID: WindowsEncodingID.UnicodeBMP,
          languageID: 0x04_09,
          name: FullName,
          nameID: NameID.FullName,
        },
        {
          platformID: PlatformID.Windows,
          encodingID: WindowsEncodingID.UnicodeBMP,
          languageID: 0x04_09,
          name: Version,
          nameID: NameID.Version,
        },
        {
          platformID: PlatformID.Windows,
          encodingID: WindowsEncodingID.UnicodeBMP,
          languageID: 0x04_09,
          name: PostScriptName,
          nameID: NameID.PostScriptName,
        },
        {
          platformID: PlatformID.Windows,
          encodingID: WindowsEncodingID.UnicodeBMP,
          languageID: 0x04_09,
          name: FamilyName,
          nameID: NameID.TypographicFamilyName,
        },
        {
          platformID: PlatformID.Windows,
          encodingID: WindowsEncodingID.UnicodeBMP,
          languageID: 0x04_09,
          name: SubfamilyName,
          nameID: NameID.TypographicSubfamilyName,
        },
        ...extraNames,
      ])
    );
    this.setTable("maxp", this.#maxp);
    this.setTable("loca", this.#loca);
    this.setTable("glyf", this.#glyf);
    this.setTable("post", this.#post);
    this.setTable("DSIG", this.#DSIG);
  }

  fixup(): void {
    this.#head.xMin = this.#glyf.glyphs
      .map((x) => x.xMin)
      .reduce((a, b) => Math.min(a, b), Infinity);
    this.#head.yMin = this.#glyf.glyphs
      .map((x) => x.yMin)
      .reduce((a, b) => Math.min(a, b), Infinity);
    this.#head.xMax = this.#glyf.glyphs
      .map((x) => x.xMax)
      .reduce((a, b) => Math.max(a, b), -Infinity);
    this.#head.yMax = this.#glyf.glyphs
      .map((x) => x.yMax)
      .reduce((a, b) => Math.max(a, b), -Infinity);
    const useLong = this.#loca.update(this.#glyf.offsets);
    this.#head.indexToLocFormat = useLong ? 1 : 0;
    this.#maxp.numGlyphs = this.#glyf.glyphs.length;
    this.#maxp.maxPoints = this.#glyf.maxPoints;
    this.#maxp.maxContours = this.#glyf.maxContours;
    this.#hhea.numberOfHMetrics = this.#hmtx.hMetrics.length;
    this.#hhea.advanceWidthMax = this.#hmtx.hMetrics
      .map((x) => x.advanceWidth)
      .reduce((a, b) => Math.max(a, b), -Infinity);
    this.#hhea.xMaxExtent = this.#glyf.glyphs
      .map((x, i) => x.xMax - x.xMin + this.#hmtx.hMetrics[i].lsb)
      .reduce((a, b) => Math.max(a, b), -Infinity);
    this.#OS_2.usWinAscent = this.#OS_2.sTypoAscender = this.#hhea.ascender;
    this.#OS_2.usWinDescent = this.#OS_2.sTypoDescender = this.#hhea.descender;
    this.#OS_2.sTypoLineGap = this.#hhea.lineGap;
    // this.#OS_2.ulCodePageRange
    super.fixup();
  }

  addGlyph<T extends GlyphHeader>(
    glyph: T,
    matrics: {
      advanceWidth: number;
      leftSideBearing: number;
    }
  ) {
    const idx = this.#glyf.glyphs.push(glyph) - 1;
    this.#hmtx.hMetrics.push(
      new longHorMetric(matrics.advanceWidth, matrics.leftSideBearing)
    );
    return idx;
  }
  set cmap(cmap: cmap) {
    this.setTable("cmap", cmap);
  }
  get cmap() {
    return this.getTable<cmap>("cmap");
  }
  get hhea() {
    return this.#hhea;
  }
  get OS_2() {
    return this.#OS_2;
  }
  get post() {
    return this.#post;
  }
  get DSIG() {
    return this.#DSIG;
  }
}
