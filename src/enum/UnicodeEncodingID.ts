export enum UnicodeEncodingID {
  /** Unicode 1.0 semantics @deprecated */
  Unicode1_0 = 0,
  /** Unicode 1.1 semantics @deprecated */
  Unicode1_1 = 1,
  /** ISO/IEC 10646 semantics @deprecated */
  ISO_10646 = 2,
  /** Unicode 2.0 and onwards semantics, Unicode BMP only
   *
   * *for use with subtable format 4 or 6* */
  Unicode2_0_BMP = 3,
  /** Unicode 2.0 and onwards semantics, Unicode full repertoire
   *
   * *for use with subtable format 10 or 12* */
  Unicode2_0_FULL = 4,
  /** Unicode Variation Sequences
   *
   * *for use with subtable format 14* */
  UnicodeVariations = 5,
  /** Unicode full repertoire
   *
   * *for use with subtable format 13* */
  UnicodeFull = 6,
}
