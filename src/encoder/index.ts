import { Fixupable } from "./basetype";
import { fieldsof } from "./decorator";
export { Encode } from "./decorator";

export function encode(
  value: any,
  view: DataView,
  offset: number,
  fields = fieldsof(value.constructor),
  fixed = false
) {
  if (!fixed && value instanceof Fixupable) value.fixup();
  for (const [prop, encoder] of Object.entries(fields)) {
    encoder.encode(value[prop], view, offset);
    offset +=
      typeof encoder.sizeof === "number"
        ? encoder.sizeof
        : encoder.sizeof(value[prop]);
  }
  return offset;
}

export function encodeIntoArrayBuffer(input: any) {
  const fields = fieldsof(input.constructor);
  if (input instanceof Fixupable) input.fixup();
  let size = 0;
  for (const [prop, encoder] of Object.entries(fields)) {
    size +=
      typeof encoder.sizeof === "number"
        ? encoder.sizeof
        : encoder.sizeof(input[prop]);
  }
  const buffer = new ArrayBuffer(size);
  const dv = new DataView(buffer);
  let offset = 0;
  for (const [prop, encoder] of Object.entries(fields)) {
    encoder.encode(input[prop], dv, offset);
    offset +=
      typeof encoder.sizeof === "number"
        ? encoder.sizeof
        : encoder.sizeof(input[prop]);
  }
  return buffer;
}

export function encodeIntoArrayBufferWithAlign(input: any, align: number) {
  const fields = fieldsof(input.constructor);
  if (input instanceof Fixupable) input.fixup();
  let size = 0;
  for (const [prop, encoder] of Object.entries(fields)) {
    size +=
      typeof encoder.sizeof === "number"
        ? encoder.sizeof
        : encoder.sizeof(input[prop]);
  }
  const origSize = size;
  if (align) {
    size = size % align === 0 ? size : size + align - (size % align);
  }
  const buffer = new ArrayBuffer(size);
  const dv = new DataView(buffer);
  let offset = 0;
  for (const [prop, encoder] of Object.entries(fields)) {
    encoder.encode(input[prop], dv, offset);
    offset +=
      typeof encoder.sizeof === "number"
        ? encoder.sizeof
        : encoder.sizeof(input[prop]);
  }
  return [origSize, buffer] as const;
}

export function sizeof(
  input: any,
  align = 0,
  fields = fieldsof(input.constructor)
) {
  let size = 0;
  for (const [prop, encoder] of Object.entries(fields)) {
    size +=
      typeof encoder.sizeof === "number"
        ? encoder.sizeof
        : encoder.sizeof(input[prop]);
  }
  if (align) return size % align === 0 ? size : size + align - (size % align);
  return size;
}

export function offsetof(input: any, targetProp: string) {
  const fields = fieldsof(input.constructor);
  let size = 0;
  for (const [prop, encoder] of Object.entries(fields)) {
    if (prop === targetProp) break;
    size +=
      typeof encoder.sizeof === "number"
        ? encoder.sizeof
        : encoder.sizeof(input[prop]);
  }
  return size;
}
