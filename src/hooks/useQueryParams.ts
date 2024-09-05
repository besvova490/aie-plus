import { useSearchParams, NavigateOptions } from "react-router-dom";

// helpers

export const useQueryParams = <T = { [key: string]: string | undefined }>(customParams = {}) => {
  const [search, setSearch] = useSearchParams();
  const params = new URLSearchParams(search);
  const queryParams: Record<string, string> = { ...customParams };

  for (const [key, value] of params) {
    queryParams[key] = value;
  }

  const setQueryParams = (obj: Record<string, string>, config?: NavigateOptions) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] !== "undefined" && obj[key] !== null) {
        params.set(key, obj[key]);
      } else {
        params.delete(key);
      }
    });

    setSearch(params.toString(), config);
  };

  const clearQueryParams = () => {
    params.forEach((_, key) => {
      params.delete(key);
    });

    setSearch(params.toString());
  }

  return [
    queryParams,
    setQueryParams,
    clearQueryParams
  ] as [T, (obj: Record<string, unknown>, shouldReplace?: boolean) => void, () => void];
};
