import { Encode } from "../encoder";
import { Fixupable } from "../encoder/basetype";
import TableRecord from "./TableRecord";

export default abstract class TableDirectory extends Fixupable {
  /** 0x00010000 or 0x4F54544F ('OTTO') */
  @Encode.uint32
  readonly sfntVersion: 0x00_01_00_00 | 0x4f_54_54_4f = 0x00_01_00_00;
  /** Number of tables. */
  @Encode.uint16
  get numTables(): number {
    return this.tableRecords.length;
  }
  /** Maximum power of 2 less than or equal to numTables, times 16 ((2**floor(log2(numTables))) * 16, where “**” is an exponentiation operator). */
  @Encode.uint16
  get searchRange(): number {
    return 16 * 2 ** Math.floor(Math.log2(this.numTables));
  }
  /** Log2 of the maximum power of 2 less than or equal to numTables (log2(searchRange/16), which is equal to floor(log2(numTables))). */
  @Encode.uint16
  get entrySelector(): number {
    return Math.floor(Math.log2(this.numTables));
  }
  /** numTables times 16, minus searchRange ((numTables * 16) - searchRange). */
  @Encode.uint16
  get rangeShift(): number {
    return this.numTables * 16 - this.searchRange;
  }
  /** Table records array—one for each top-level table in the font */
  @Encode.array(TableRecord)
  tableRecords: TableRecord[] = [];

  constructor(sfntVersion: 0x00_01_00_00 | 0x4f_54_54_4f) {
    super();
    this.sfntVersion = sfntVersion;
  }
}
