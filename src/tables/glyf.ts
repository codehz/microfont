import { Encode, sizeof } from "../encoder";

export enum GlyphBitFlags {
  None = 0,
  OnCurve = 1 << 0,
  XShortVector = 1 << 1,
  YShortVector = 1 << 2,
  Repeat = 1 << 3,
  PositiveXShortVector = 1 << 4,
  PositiveYShortVector = 1 << 5,
  XSame = 1 << 4,
  YSame = 1 << 5,
}

function debugGlyphBitFlags(flags: GlyphBitFlags) {
  let str = "";
  if (flags & GlyphBitFlags.OnCurve) str += "OnCurve ";
  if (flags & GlyphBitFlags.XShortVector) {
    str += "XShortVector ";
    if (flags & GlyphBitFlags.PositiveXShortVector)
      str += "PositiveXShortVector ";
  } else if (flags & GlyphBitFlags.XSame) str += "XSame ";
  if (flags & GlyphBitFlags.YShortVector) {
    str += "YShortVector ";
    if (flags & GlyphBitFlags.PositiveYShortVector)
      str += "PositiveYShortVector ";
  } else if (flags & GlyphBitFlags.YSame) str += "YSame ";
  if (flags & GlyphBitFlags.Repeat) str += "Repeat ";
  return str;
}

export class GlyphHeader {
  /** If the number of contours is greater than or equal to zero, this is a simple glyph. If negative, this is a composite glyph — the value -1 should be used for composite glyphs. */
  @Encode.int16
  numberOfContours: number = 0;
  @Encode.int16
  xMin: number = 0;
  @Encode.int16
  yMin: number = 0;
  @Encode.int16
  xMax: number = 0;
  @Encode.int16
  yMax: number = 0;
  constructor(numberOfContours: number) {
    this.numberOfContours = numberOfContours;
  }
  $maxPoints = 0;
}

export interface GlyphPoint {
  x: number;
  y: number;
  onCurve?: boolean;
}

export interface GlyphContour {
  points: GlyphPoint[];
}

export class SimpleGlyphTable extends GlyphHeader {
  @Encode.numarray(2)
  endPtsOfContours: number[];
  @Encode.uint16
  get instructionLength() {
    return this.instructions.length;
  }
  @Encode.numarray(1)
  instructions: number[];
  @Encode.numarray(1)
  flags: number[];
  @Encode.DataView
  xCoordinates: DataView;
  @Encode.DataView
  yCoordinates: DataView;
  constructor({
    contours,
    instructions = [],
    xMin,
    yMin,
    xMax,
    yMax,
  }: {
    contours: GlyphContour[];
    instructions?: number[];
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  }) {
    super(contours.length);
    this.$maxPoints = contours
      .map((contour) => contour.points.length)
      .reduce((a, b) => Math.max(a, b), 0);
    this.xMin = xMin;
    this.yMin = yMin;
    this.xMax = xMax;
    this.yMax = yMax;
    const pointCount = contours.reduce(
      (acc, contour) => acc + contour.points.length,
      0
    );
    this.endPtsOfContours = [];
    const flags: number[] = [];
    const xcoordbuf = new ArrayBuffer(pointCount * 2);
    const ycoordbuf = new ArrayBuffer(pointCount * 2);
    const xcoordview = new DataView(xcoordbuf);
    const ycoordview = new DataView(ycoordbuf);
    let xcoordpos = 0;
    let ycoordpos = 0;
    let lastpoint: GlyphPoint = { x: 0, y: 0 };
    let repeat = false;
    for (const contour of contours) {
      let lastdiff: GlyphPoint | undefined;
      for (const point of contour.points) {
        let flag = point.onCurve ? GlyphBitFlags.OnCurve : GlyphBitFlags.None;
        const diff = {
          x: point.x - lastpoint.x,
          y: point.y - lastpoint.y,
        };
        if (lastdiff) {
          const same =
            lastdiff.x === diff.x &&
            lastdiff.y === diff.y &&
            lastdiff.onCurve === point.onCurve;
          if (same) {
            if (repeat) {
              flags[flags.length - 1]++;
            } else {
              repeat = true;
              flags[flags.length - 1] |= GlyphBitFlags.Repeat;
              flags.push(1);
            }
            continue;
          } else {
            if (lastpoint.x === point.x) {
              flag |= GlyphBitFlags.XSame;
            } else if (diff.x >= -255 && diff.x <= 255) {
              flag |= GlyphBitFlags.XShortVector;
              if (diff.x >= 0) {
                flag |= GlyphBitFlags.PositiveXShortVector;
              }
              xcoordview.setUint8(xcoordpos, Math.abs(diff.x));
              xcoordpos++;
            } else {
              xcoordview.setInt16(xcoordpos, diff.x);
              xcoordpos += 2;
            }
            if (lastpoint.y === point.y) {
              flag |= GlyphBitFlags.YSame;
            } else if (diff.y >= -255 && diff.y <= 255) {
              flag |= GlyphBitFlags.YShortVector;
              if (diff.y >= 0) {
                flag |= GlyphBitFlags.PositiveYShortVector;
              }
              ycoordview.setUint8(ycoordpos, Math.abs(diff.y));
              ycoordpos++;
            } else {
              ycoordview.setInt16(ycoordpos, diff.y);
              ycoordpos += 2;
            }
          }
        } else {
          if (diff.x >= -255 && diff.x <= 255) {
            flag |= GlyphBitFlags.XShortVector;
            if (diff.x >= 0) {
              flag |= GlyphBitFlags.PositiveXShortVector;
            }
            xcoordview.setUint8(xcoordpos, Math.abs(diff.x));
            xcoordpos++;
          } else {
            xcoordview.setInt16(xcoordpos, diff.x);
            xcoordpos += 2;
          }
          if (diff.y >= -255 && diff.y <= 255) {
            flag |= GlyphBitFlags.YShortVector;
            if (diff.y >= 0) {
              flag |= GlyphBitFlags.PositiveYShortVector;
            }
            ycoordview.setUint8(ycoordpos, Math.abs(diff.y));
            ycoordpos++;
          } else {
            ycoordview.setInt16(ycoordpos, diff.y);
            ycoordpos += 2;
          }
        }
        lastdiff = diff;
        repeat = false;
        // console.log(debugGlyphBitFlags(flag));
        flags.push(flag);
        lastpoint = point;
      }
      this.endPtsOfContours.push(flags.length - 1);
    }
    this.instructions = instructions;
    this.flags = flags;
    this.xCoordinates = new DataView(xcoordbuf, 0, xcoordpos);
    this.yCoordinates = new DataView(ycoordbuf, 0, ycoordpos);
  }
}

export default class glyf {
  @Encode.dynarray(2)
  glyphs: GlyphHeader[] = [];

  get offsets() {
    const offsets = this.glyphs.reduce(
      (acc: number[], item: GlyphHeader) => [
        ...acc,
        acc.at(-1)! + sizeof(item, 2),
      ],
      [0]
    );
    // console.log(this, offsets);
    return offsets;
  }

  get maxPoints() {
    return this.glyphs
      .map((x) => x.$maxPoints)
      .reduce((a, b) => Math.max(a, b), 0);
  }

  get maxContours() {
    return this.glyphs
      .map((x) => x.numberOfContours)
      .reduce((a, b) => Math.max(a, b), 0);
  }
}
