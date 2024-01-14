import { Encode } from "../encoder";

export class SignatureRecord {
  /** Format of the signature */
  @Encode.uint32
  format: number = 1;
  /** Length of signature in bytes */
  @Encode.uint32
  length: number = 0;
  /** Offset to the signature block from the beginning of the table */
  @Encode.Offset32
  signatureBlockOffset: number = 0;
}

export default class DSIG {
  /** Version number of the DSIG table (0x00000001) */
  @Encode.Version16Dot16
  readonly version: [number, number] = [0, 1];
  /** Number of signatures in the table */
  @Encode.uint16
  get numSignatures() {
    return this.signatureRecords.length;
  }
  /**
   * permission flags
   * * Bit 0: cannot be resigned
   * * Bits 1-7: Reserved (Set to 0)
   */
  @Encode.uint16
  flags: number = 0;
  /** Array of signature records */
  @Encode.array(SignatureRecord)
  signatureRecords: SignatureRecord[] = [];
  @Encode.dynarray()
  signatureBlocks: SignatureBlock[] = [];
}

export class SignatureBlock {
  @Encode.uint16
  readonly reversed1: number = 0;
  @Encode.uint16
  readonly reversed2: number = 0;
  /** Length (in bytes) of the PKCS#7 packet in the signature field. */
  @Encode.uint32
  get signatureLength() {
    return this.signature.length;
  }
  /** PKCS#7 packet */
  @Encode.numarray(1)
  signature: number[] = [];
}
