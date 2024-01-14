export interface TypeEncoder<T = any> {
  sizeof: number | ((value: T) => number);
  encode(value: T, view: DataView, offset: number): void;
}

export namespace BaseType {
  export const uint8: TypeEncoder<number> = {
    sizeof: 1,
    encode(value, view, offset) {
      view.setUint8(offset, value);
    },
  };
  export const int8: TypeEncoder<number> = {
    sizeof: 1,
    encode(value, view, offset) {
      view.setInt8(offset, value);
    },
  };
  export const uint16: TypeEncoder<number> = {
    sizeof: 2,
    encode(value, view, offset) {
      view.setUint16(offset, value);
    },
  };
  export const int16: TypeEncoder<number> = {
    sizeof: 2,
    encode(value, view, offset) {
      view.setInt16(offset, value);
    },
  };
  export const uint24: TypeEncoder<number> = {
    sizeof: 3,
    encode(value, view, offset) {
      view.setUint8(offset, value >> 16);
      view.setUint8(offset + 1, value >> 8);
      view.setUint8(offset + 2, value);
    },
  };
  export const uint32: TypeEncoder<number> = {
    sizeof: 4,
    encode(value, view, offset) {
      view.setUint32(offset, value);
    },
  };
  export const Fixed: TypeEncoder<number> = {
    sizeof: 4,
    encode(value, view, offset) {
      const MIN_16_16 = -(1 << 15);
      const MAX_16_16 = (1 << 15) - 1 + 1 / (1 << 16);
      if (value > MAX_16_16 || value < MIN_16_16) {
        throw new Error("Fixed value out of range");
      }
      const ulong = Math.round(value * (1 << 16)) | 0;
      view.setUint32(offset, ulong);
    },
  };
  export const FWORD = int16;
  export const UFWORD = uint16;
  export const F2DOT14: TypeEncoder<number> = {
    sizeof: 4,
    encode(value, view, offset) {
      view.setUint16(offset, Math.round(value * 16_384));
    },
  };
  export const LONGDATETIME: TypeEncoder<number | bigint> = {
    sizeof: 8,
    encode(value, view, offset) {
      if (typeof value === "number") {
        value = BigInt(value);
      }
      view.setBigUint64(offset, value);
    },
  };
  export const Tag: TypeEncoder<string> = {
    sizeof: 4,
    encode(value, view, offset) {
      view.setUint8(offset, value.charCodeAt(0));
      view.setUint8(offset + 1, value.charCodeAt(1));
      view.setUint8(offset + 2, value.charCodeAt(2));
      view.setUint8(offset + 3, value.charCodeAt(3));
    },
  };
  export const Offset16 = uint16;
  export const Offset24 = uint24;
  export const Offset32 = uint32;
  export const Version16Dot16: TypeEncoder<[number, number]> = {
    sizeof: 4,
    encode(value, view, offset) {
      view.setUint16(offset, value[0]);
      view.setUint16(offset + 2, value[1]);
    },
  };
  export const TypedArray: TypeEncoder<TypedArray | DataView> = {
    sizeof(value) {
      return value.byteLength;
    },
    encode(value, view, offset) {
      const target = new Uint8Array(
        view.buffer,
        view.byteOffset,
        view.byteLength
      );
      const source = new Uint8Array(
        value.buffer,
        value.byteOffset,
        value.byteLength
      );
      target.set(source, offset);
    },
  };
  export const DataView = TypedArray;
  export const ArrayBuffer: TypeEncoder<ArrayBuffer> = {
    sizeof(value) {
      return value.byteLength;
    },
    encode(value, view, offset) {
      const target = new Uint8Array(
        view.buffer,
        view.byteOffset,
        view.byteLength
      );
      const source = new Uint8Array(value);
      target.set(source, offset);
    },
  };
}

export abstract class Fixupable {
  abstract fixup(): void;
}
