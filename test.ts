import { SimpleGlyph, TrueTypeFont } from "./src/TrueTypeFont";
import { encodeIntoArrayBuffer } from "./src/encoder";
import { cmapBmp, cmap_subtable_format4 } from "./src/tables/cmap";

const font = new TrueTypeFont({
  unitsPerEm: 32,
  FamilyName: "test",
  UniqueID: "0.000;XXXX;test-Regular",
  Version: "Version 0.000",
});
font.addGlyph(
  new SimpleGlyph({
    contours: [
      {
        points: [
          {
            x: 0,
            y: 0,
            onCurve: true,
          },
          {
            x: 0,
            y: 32,
            onCurve: true,
          },
          {
            x: 32,
            y: 32,
            onCurve: true,
          },
          {
            x: 32,
            y: 0,
            onCurve: true,
          },
        ],
      },
    ],
    xMin: 0,
    yMin: 0,
    xMax: 32,
    yMax: 32,
  }),
  {
    advanceWidth: 32,
    leftSideBearing: 0,
  }
);
font.addGlyph(
  new SimpleGlyph({
    contours: [
      {
        points: [
          {
            x: 0,
            y: 0,
            onCurve: true,
          },
          {
            x: 32,
            y: 0,
            onCurve: true,
          },
          {
            x: 32,
            y: 32,
            onCurve: false,
          },
          {
            x: 0,
            y: 32,
            onCurve: true,
          },
        ],
      },
    ],
    xMin: 0,
    yMin: 0,
    xMax: 32,
    yMax: 32,
  }),
  {
    advanceWidth: 32,
    leftSideBearing: 0,
  }
);
font.cmap = new cmapBmp(
  new cmap_subtable_format4([
    { code: 65, glyphId: 1 },
    { code: 32, glyphId: 2 },
  ])
);
font.OS_2.usFirstCharIndex = 32;
font.OS_2.usLastCharIndex = 65;
const buffer = encodeIntoArrayBuffer(font);
await Bun.write("test.ttf", buffer);
