import { Encode } from "../encoder";

export default class TableRecord {
  /** Table identifier. */
  @Encode.Tag
  tableTag: string;
  /** Checksum for this table. */
  @Encode.uint32
  checksum: number = 0;
  /** Offset from beginning of font file. */
  @Encode.Offset32
  offset: number = 0;
  /** Length of this table. */
  @Encode.uint32
  length: number = 0;
  constructor(tableTag: string) {
    this.tableTag = tableTag;
  }
}
