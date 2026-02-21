export function normalize(
  value: number,
  numerator: number,
  denominator: number,
) {
  return Math.floor((value / numerator) * denominator);
}
