import { Encode, offsetof } from "../encoder";
import type { MacintoshEncodingID } from "../enum/MacintoshEncodingID";
import type { NameID } from "../enum/NameID";
import { PlatformID } from "../enum/PlatformID";
import { UnicodeEncodingID } from "../enum/UnicodeEncodingID";
import type { WindowsEncodingID } from "../enum/WindowsEncodingID";
import { encodeToUtf16 } from "../utils/utf16";

export class NameRecord {
  @Encode.uint16
  platformID: PlatformID = PlatformID.Unicode;
  @Encode.uint16
  encodingID: UnicodeEncodingID | WindowsEncodingID | MacintoshEncodingID = 0;
  @Encode.uint16
  languageID: number = 0;
  @Encode.uint16
  nameID: NameID = 0;
  /** String length (in bytes). */
  @Encode.uint16
  length: number = 0;
  /** String offset from start of storage area (in bytes). */
  @Encode.Offset16
  stringOffset: number = 0;
}

export type NameDef = {
  platformID: PlatformID;
  encodingID: UnicodeEncodingID | WindowsEncodingID | MacintoshEncodingID;
  nameID: NameID;
  languageID?: number;
  name: string;
};

export class name {
  @Encode.uint16
  readonly version: number = 0;
  /** Number of name records. */
  @Encode.uint16
  get count(): number {
    return this.nameRecord.length;
  }
  /** Offset to start of string storage (from start of table). */
  @Encode.uint16
  get storageOffset(): number {
    return offsetof(this, "strings");
  }
  @Encode.array(NameRecord)
  nameRecord: NameRecord[];
  @Encode.TypedArray
  strings: Uint8Array;
  constructor(names: NameDef[]) {
    // TODO: optimize
    const sorted = names.toSorted((a, b) => b.name.length - a.name.length);
    let u8str: string = "";
    let u16str: string = "";
    for (const { name, platformID } of sorted) {
      if (platformID === PlatformID.Macintosh) {
        if (u8str.includes(name)) {
          continue;
        }
        u8str += name;
      } else {
        if (u16str.includes(name)) {
          continue;
        }
        u16str += name;
      }
    }
    const u8enc = new TextEncoder().encode(u8str);
    this.strings = Buffer.concat([
      u8enc,
      new Uint8Array(encodeToUtf16(u16str)),
    ]);
    this.nameRecord = names.map(
      ({ platformID, encodingID, languageID = 0, nameID, name }) => {
        const ret = new NameRecord();
        ret.platformID = platformID;
        ret.encodingID = encodingID;
        ret.languageID = languageID;
        ret.nameID = nameID;
        ret.stringOffset =
          platformID === PlatformID.Macintosh
            ? u8str.indexOf(name)
            : u8enc.length + u16str.indexOf(name) * 2;
        ret.length =
          platformID === PlatformID.Macintosh ? name.length : name.length * 2;
        return ret;
      }
    );
  }
}
