import {
  cmapBmp,
  cmap_subtable_format4,
  encodeIntoArrayBuffer,
} from "microfont";
import "./default-glyph";
import { font } from "./font";
import { maps } from "./glyphs";

font.cmap = new cmapBmp(new cmap_subtable_format4(maps));
const result = encodeIntoArrayBuffer(font);
Bun.write("bars3d.ttf", result);
