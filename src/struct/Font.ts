import { Encode, encodeIntoArrayBufferWithAlign } from "../encoder";
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
      console.log(name);
      record.checksum = calcTableChecksum(encoded);
      offset += record.length = length;
      offset = offset % 4 === 0 ? offset : offset + 4 - (offset % 4);
      return record;
    });
  }
}

function calcTableChecksum(table: ArrayBuffer) {
  const arr = new DataView(table);
  let sum = 0;
  for (let i = 0; i < arr.byteLength; i += 4) {
    sum = (sum + arr.getUint32(i)) % 0x1_00_00_00_00;
    console.log(
      sum.toString(16).padStart(8, "0"),
      arr.getUint32(i).toString(16).padStart(8, "0")
    );
  }
  return sum;
}
