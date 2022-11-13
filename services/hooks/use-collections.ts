import { useEffect, useMemo } from "react";
import useService from "../../hooks";
import { useAppSelector } from "../../store/hooks";
import { getCollections } from "../collection";

interface ReturnValues {
  collections: Array<{ name: string }>;
  isFetching: boolean;
}

const useCollections = function useCollections(): ReturnValues {
  const { uri, database, isConnect } = useAppSelector(
    (state) => state.connection
  );
  const { data, fetch, isFetching } = useService({
    initialData: {},
    service: getCollections,
  });

  useEffect(() => {
    if (!isConnect || !database) {
      return;
    }

    fetch({ uri, database });
  }, [database, fetch, isConnect, uri]);

  const collections = useMemo(() => data?.data ?? [], [data]);

  return { collections, isFetching };
};

export default useCollections;
