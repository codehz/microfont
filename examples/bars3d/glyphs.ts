import { SimpleGlyph, type CharacterMap } from "microfont";
import { c0, cequal, cplus, cspace } from "./chars";
import { font, units } from "./font";

const shift = 72;
const step = 8;
export const equal = font.addGlyph(
  new SimpleGlyph({
    contours: [
      {
        points: [
          {
            x: 0,
            y: units / 2,
            onCurve: true,
          },
          {
            x: shift,
            y: 0,
            onCurve: true,
          },
          {
            x: shift * 2,
            y: units / 2,
            onCurve: true,
          },
          {
            x: shift,
            y: units,
            onCurve: true
          }
        ],
      },
    ],
    xMin: 0,
    xMax: shift * 2,
    yMin: 0,
    yMax: units,
  }),
  {
    advanceWidth: shift * 2,
    leftSideBearing: 0,
  }
);
export const plus = font.addGlyph(
  new SimpleGlyph({ contours: [], xMin: 0, xMax: 0, yMin: 0, yMax: 0 }),
  {
    advanceWidth: 0,
    leftSideBearing: 0,
  }
);
export const space = font.addGlyph(
  new SimpleGlyph({ contours: [], xMin: 0, xMax: 0, yMin: 0, yMax: 0 }),
  {
    advanceWidth: units / 2,
    leftSideBearing: 0,
  }
);
export const base = font.addGlyph(
  new SimpleGlyph({ contours: [], xMin: 0, xMax: 0, yMin: 0, yMax: 0 }),
  {
    advanceWidth: 0,
    leftSideBearing: 0,
  }
);
export const maps: CharacterMap[] = [
  { code: c0, glyphId: base },
  { code: cspace, glyphId: space },
  { code: cplus, glyphId: plus },
  { code: cequal, glyphId: equal },
];

for (let i = 1; i <= 1000; i++) {
  const glyphId = font.addGlyph(
    new SimpleGlyph({
      contours: [
        {
          points: [
            {
              x: 0,
              y: units / 2,
              onCurve: true,
            },
            {
              x: shift,
              y: 0,
              onCurve: true,
            },
            {
              x: shift + i * step,
              y: 0,
              onCurve: true,
            },
            {
              x: i * step,
              y: units / 2,
              onCurve: true,
            },
            {
              x: shift + i * step,
              y: units,
              onCurve: true,
            },
            {
              x: shift,
              y: units,
              onCurve: true,
            },
          ],
        },
      ],
      xMin: 0,
      xMax: shift + i * step,
      yMin: 0,
      yMax: units,
    }),
    {
      advanceWidth: i * step,
      leftSideBearing: 0,
    }
  );
  if (i < 10) {
    maps.push({ code: c0 + i, glyphId });
  }
}
