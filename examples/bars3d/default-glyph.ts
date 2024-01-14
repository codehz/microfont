import { SimpleGlyph } from "microfont";
import { font, units } from "./font";

export const defaultGlyph = font.addGlyph(
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
            y: units,
            onCurve: true,
          },
          {
            x: units,
            y: units,
            onCurve: true,
          },
          {
            x: units,
            y: 0,
            onCurve: true,
          },
        ],
      },
    ],
    xMin: 0,
    xMax: units,
    yMin: 0,
    yMax: units,
  }),
  {
    advanceWidth: units,
    leftSideBearing: 0,
  }
);
