export class XMap<K extends number | string, V> {
  #data: Record<K, V> = Object.create(null);

  get length() {
    return Object.keys(this.#data).length;
  }

  get sortedEntries(): [string, V][] {
    return Object.entries<V>(this.#data).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }

  get sortedValues(): V[] {
    return this.sortedEntries.map(([, v]) => v);
  }

  get(idx: K): V | undefined {
    return this.#data[idx];
  }
  add(idx: K, obj: V) {
    return this.#data[idx] = obj;
  }
  delete(idx: K) {
    delete this.#data[idx];
  }
  clear() {
    this.#data = Object.create(null);
  }
}
