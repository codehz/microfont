export class Radix {
  children: Radix[] = [];
  constructor(public value = "") {}

  insert(value: string) {
    if (this.value === value) return;
    for (const child of this.children) {
      if (value.startsWith(child.value)) {
        const len = child.value.length;
        child.insert(value.substring(len));
        return;
      }
    }
    this.children.push(new Radix(value));
  }

  get length() {
    let length = this.value.length;
    for (const child of this.children) {
      length += child.length;
    }
    return length;
  }

  contains(target: string, current = this.value): boolean {
    for (const child of this.children) {
      const newval = current + child.value;
      if (newval === target) {
        return true;
      }
      if (target.startsWith(newval)) {
        return child.contains(target, newval);
      }
    }
    return false;
  }

  reconstruct(value?: string) {
    let result: string[] = [];
    value = value !== undefined ? value + this.value : this.value;
    if (value.length) {
      result.push(value);
    }
    for (const child of this.children) {
      result = result.concat(child.reconstruct(value));
    }
    return result;
  }
}
