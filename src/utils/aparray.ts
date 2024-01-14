export function aparray<R, T extends {}>(
  input: T | undefined | null,
  fn: (input: T) => R
): [R] | [] {
  return input == null ? [] : [fn(input)];
}
