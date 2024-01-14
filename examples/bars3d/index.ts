import {
  CoverageFormat1,
  Feature,
  GSUBv0,
  LangSys,
  Ligature,
  LigatureSet,
  LigatureSubst,
  Script,
  SingleSubst2,
  cmapBmp,
  cmap_subtable_format4,
  encodeIntoArrayBuffer,
} from "microfont";
import "./default-glyph";
import { font } from "./font";
import { base, equal, maps, plus } from "./glyphs";

font.cmap = new cmapBmp(new cmap_subtable_format4(maps));

const gsub = font.setTable("GSUB", new GSUBv0());
const testSubst = gsub.lookupList.addLookup(1, (table) => {
  table.subtables.push(new SingleSubst2(new CoverageFormat1([plus]), [equal]));
});
const testLiga = gsub.lookupList.addLookup(4, (table) => {
  table.subtables.push(
    new LigatureSubst(new CoverageFormat1([base + 1]), [
      new LigatureSet([new Ligature([base], base + 10)]),
    ])
  );
});
const dflt = gsub.scriptList
  .add("DFLT", new Script())
  .langSysList.add("dflt", new LangSys());
dflt.featureIndices.push(
  gsub.featureList.add("aalt", new Feature([testSubst])),
  gsub.featureList.add("liga", new Feature([testLiga]))
);
const result = encodeIntoArrayBuffer(font);
Bun.write("bars3d.ttf", result);
