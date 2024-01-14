import { encode, sizeof } from ".";
import { BaseType, Fixupable, type TypeEncoder } from "./basetype";

const FieldStorage = new WeakMap<{}, Record<string, TypeEncoder<any>>>();

function getFieldsForClass(
  clazz: any,
  create = false
): Record<string, TypeEncoder<any>> {
  let ret = FieldStorage.get(clazz);
  if (!ret) {
    if (create) FieldStorage.set(clazz, (ret = Object.create(null)));
    else return Object.create(null);
  }
  return ret!;
}

export function fieldsof(clazz: any, create = false) {
  if (create) {
    return getFieldsForClass(clazz, true);
  }
  let curr: Record<string, TypeEncoder<any>> = {};
  while (clazz != null) {
    const prev = getFieldsForClass(clazz);
    curr = { ...prev, ...curr };
    clazz = Object.getPrototypeOf(clazz);
  }
  return curr;
}

function generateEncodeDecorator<T = any>(
  encoder: TypeEncoder<T>
): PropertyDecorator {
  return ((proto: any, prop: string) => {
    fieldsof(proto.constructor, true)[prop] = encoder;
  }) as PropertyDecorator;
}

export const Encode = Object.freeze(
  Object.assign(generateEncodeDecorator({ sizeof, encode }), {
    ...(Object.fromEntries(
      Object.entries(BaseType).map(([k, v]) => [
        k,
        generateEncodeDecorator<any>(v),
      ])
    ) as { readonly [K in keyof typeof BaseType]: PropertyDecorator }),
    typed(type: Object) {
      const fields = fieldsof(type);
      return generateEncodeDecorator({
        sizeof(value) {
          if (value instanceof Fixupable) value.fixup();
          return sizeof(value, 0, fields);
        },
        encode(value, view, offset) {
          return encode(value, view, offset, fields, true);
        },
      });
    },
    array(type: Object, align: number = 0) {
      const fields = fieldsof(type);
      return generateEncodeDecorator({
        sizeof(value) {
          if (value.length === 0) return 0;
          let size = 0;
          for (const item of value) {
            if (item instanceof Fixupable) item.fixup();
            size += sizeof(item, align, fields);
            if (align) {
              size = size % align === 0 ? size : size + align - (size % align);
            }
          }
          return size;
        },
        encode(value, view, offset) {
          if (value.length === 0) return;
          for (const item of value) {
            offset = encode(item, view, offset, fields, true);
            if (align) {
              offset =
                offset % align === 0
                  ? offset
                  : offset + align - (offset % align);
            }
          }
        },
      });
    },
    dynarray(align = 0) {
      return generateEncodeDecorator<any[]>({
        sizeof(value) {
          if (value.length === 0) return 0;
          let size = 0;
          for (const item of value) {
            if (item instanceof Fixupable) item.fixup();
            size += sizeof(item, align);
            if (align) {
              size = size % align === 0 ? size : size + align - (size % align);
            }
          }
          return size;
        },
        encode(value, view, offset) {
          if (value.length === 0) return;
          for (const item of value) {
            offset = encode(item, view, offset);
            if (align) {
              offset =
                offset % align === 0
                  ? offset
                  : offset + align - (offset % align);
            }
          }
        },
      });
    },
    numarray(width: 1 | 2 | 4 = 1, signed = false) {
      return generateEncodeDecorator<number[]>({
        sizeof(value) {
          return width * value.length;
        },
        encode(value, view, offset) {
          const fn =
            width === 1
              ? signed
                ? "setInt8"
                : "setUint8"
              : width === 2
              ? signed
                ? "setInt16"
                : "setUint16"
              : width === 4
              ? signed
                ? "setInt32"
                : "setUint32"
              : undefined;
          if (fn) {
            for (const item of value) {
              view[fn](offset, item);
              offset += width;
            }
          } else {
            throw new Error(`Unsupported width: ${width}`);
          }
        },
      });
    },
    custom(encoder: TypeEncoder<any>) {
      return generateEncodeDecorator(encoder);
    },
  })
);
