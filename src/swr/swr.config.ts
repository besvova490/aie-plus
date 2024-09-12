export const SWR_CONFIG = {
  fetcher: (key: string) => {
    const data = localStorage.getItem(key);

    return data ? JSON.parse(data) : null;
  }
};
