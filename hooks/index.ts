import { useState, useRef, useCallback, useEffect } from "react";
import axios, { AxiosError, CancelTokenSource } from "axios";

interface UseServiceProps<T> {
  initialData?: any;
  autoCancel?: boolean;
  service: (params: T, options: any) => any;
}

const useService = function useServiceHook<T>({
  initialData = null,
  autoCancel = true,
  service,
}: UseServiceProps<T>) {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState(initialData);
  const [initData] = useState(initialData);
  const cancelTokenSource = useRef<CancelTokenSource | null>(null);

  const cancel = useCallback(() => {
    setIsFetching(false);
    try {
      cancelTokenSource?.current?.cancel();
    } catch (thrown) {
      // do nothing
    }
  }, []);

  const resetData = useCallback(() => setData(initData), [initData]);

  const fetch = useCallback(
    async (params: T) => {
      if (autoCancel) {
        cancel();
      }

      if (cancelTokenSource?.current) {
        cancelTokenSource.current = axios.CancelToken.source();
      }

      setIsFetching(true);
      setError(null);

      try {
        const response = await service(params, {
          cancelToken: cancelTokenSource?.current?.token,
        });

        setData(response);
        setIsFetching(false);
      } catch (thrown: any) {
        if (!axios.isCancel(thrown)) {
          setIsFetching(false);
          setError(thrown);
        }
      }
    },
    [autoCancel, service, cancel]
  );

  useEffect(
    () => () => {
      cancel();
      setIsFetching(false);
      setError(null);
    },
    [cancel]
  );

  return {
    fetch,
    cancel,
    resetData,

    isFetching,
    error,
    data,
  };
};

export default useService;
