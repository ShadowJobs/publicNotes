export const formatJSON = (object: object | string | null | undefined) =>
  typeof object === "string" ? object : JSON.stringify(object, null, 2);

export const formatDate = (date: string) => new Date(date).toLocaleString();

export const formatSnakeCaseToTitleCase = (str: string) =>
  str.replaceAll("_", " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
