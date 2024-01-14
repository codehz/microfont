import { Encode, encodeIntoArrayBufferWithAlign } from "../encoder";
import { calcChecksum } from "../utils/checksum";
import TableDirectory from "./TableDirectory";
import TableRecord from "./TableRecord";

export default class Font extends TableDirectory {
  #tables: Record<string, any> = Object.create(null);

  @Encode.TypedArray
  private cached!: Buffer;

  setTable<T>(name: string, table: T) {
    this.#tables[name] = table;
    return table;
  }

  getTable<T>(name: string) {
    return this.#tables[name] as T;
  }

  override fixup() {
    this.cached = Buffer.allocUnsafe(0);
    let offset = 12 + 16 * Object.keys(this.#tables).length;
    this.tableRecords = Object.entries(this.#tables).map(([name, table]) => {
      const record = new TableRecord(name);
      const [length, encoded] = encodeIntoArrayBufferWithAlign(table, 4);
      this.cached = Buffer.concat([this.cached, new Uint8Array(encoded)]);
      record.offset = offset;
      record.checksum = calcChecksum(encoded);
      record.length = length;
      offset += encoded.byteLength;
      return record;
    });
  }
}
