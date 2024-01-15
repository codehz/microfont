import {
  CoverageFormat1,
  Feature,
  GSUBv0,
  LangSys,
  Ligature,
  LigatureSet,
  LigatureSubst,
  Script,
  cmapBmp,
  cmap_subtable_format4,
  encodeIntoArrayBuffer,
} from "microfont";
import "./default-glyph";
import { font } from "./font";
import { base, maps } from "./glyphs";

font.cmap = new cmapBmp(new cmap_subtable_format4(maps));

function range(min: number, max: number) {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

const gsub = font.setTable("GSUB", new GSUBv0());
const fourLiga = gsub.lookupList.addLookup(4, (table) => {
  table.subtables.push(
    new LigatureSubst(new CoverageFormat1([base + 1]), [
      new LigatureSet([new Ligature([base, base, base], base + 1000)]),
    ])
  );
});
const threeLiga = gsub.lookupList.addLookup(4, (table) => {
  table.subtables.push(
    ...range(1, 9).map(
      (f0) =>
        new LigatureSubst(new CoverageFormat1([base + f0]), [
          new LigatureSet([
            ...range(0, 9).flatMap((f1) =>
              range(0, 9).flatMap(
                (f2) =>
                  new Ligature(
                    [base + f1, base + f2],
                    base + 100 * f0 + 10 * f1 + f2
                  )
              )
            ),
          ]),
        ])
    )
  );
});
const twoLiga = gsub.lookupList.addLookup(4, (table) => {
  table.subtables.push(
    ...range(1, 9).map(
      (f0) =>
        new LigatureSubst(new CoverageFormat1([base + f0]), [
          new LigatureSet([
            ...range(0, 9).map(
              (f1) => new Ligature([base + f1], base + 10 * f0 + f1)
            ),
          ]),
        ])
    )
  );
});
const dflt = gsub.scriptList
  .add("DFLT", new Script())
  .setDefaultLangSys(new LangSys());
dflt.featureIndices.push(
  gsub.featureList.add("liga", new Feature([fourLiga, threeLiga, twoLiga]))
);
const result = encodeIntoArrayBuffer(font);
Bun.write("bars3d.ttf", result);
