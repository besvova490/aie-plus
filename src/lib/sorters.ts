import get from "lodash.get";

export const SORTERS = {
  string: (key: string) => (a: string, b: string) => get(a, key).localeCompare(get(b, key)),
  date: (key: string) => (a: string, b: string) => new Date(get(a, key)).getTime() - new Date(get(b, key)).getTime(),
  number: (key: string) => (a: string, b: string) => Number(get(a, key)) - Number(get(b, key))
};
