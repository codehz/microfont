import { Encode, sizeof } from "../encoder";
import TableDirectory from "./TableDirectory";
import TableRecord from "./TableRecord";

export default class Font extends TableDirectory {
  #tables: Record<string, any> = Object.create(null);

  @Encode.dynarray(4)
  get tables() {
    return Object.values(this.#tables);
  }

  setTable<T>(name: string, table: T) {
    this.#tables[name] = table;
    return table;
  }

  getTable<T>(name: string) {
    return this.#tables[name] as T;
  }

  override fixup() {
    let offset = 12 + 16 * Object.keys(this.#tables).length;
    this.tableRecords = Object.entries(this.#tables).map(([name, table]) => {
      const record = new TableRecord(name);
      record.offset = offset;
      offset += record.length = sizeof(table);
      offset = offset % 4 === 0 ? offset : offset + 4 - (offset % 4);
      return record;
    });
  }
}
