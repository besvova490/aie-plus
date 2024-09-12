import React, { useCallback } from "react";
import debounce from "lodash.debounce";

interface IUseDebounce {
  timeout?: number;
  deps?: React.DependencyList;
}

export function useDebounce(config?: IUseDebounce) {
  const { timeout = 500, deps = [] } = config || {};

  const debounced = useCallback(
    debounce((fn: () => void) => fn(), timeout),
    [...deps]
  );

  return debounced;
}
