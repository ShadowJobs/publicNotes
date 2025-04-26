export const formatNumber = (value: number) => {
  const number = `${value}`;
  const match = number.match(/(-?\d+\.\d{1,5})\d*/); // keep 5 digits after the point
  return match === null ? number : match[1];
};
