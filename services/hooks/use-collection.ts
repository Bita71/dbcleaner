import { useCallback, useEffect, useMemo } from "react";
import useService from "../../hooks";
import { useAppSelector } from "../../store/hooks";
import { showCollection } from "../collection";

interface ReturnValues {
  collection: Array<any>;
  isFetching: boolean;
  update: () => void;
}

const useCollection = function useCollection(): ReturnValues {
  const { uri, database, collection, isConnect } = useAppSelector(
    (state) => state.connection
  );
  const { data, fetch, isFetching } = useService({
    initialData: {},
    service: showCollection,
  });

  const update = useCallback(
    () => fetch({ uri, database, collection }),
    [collection, database, fetch, uri]
  );

  useEffect(() => {
    if (!isConnect || !database || !collection) {
      return;
    }
    update()
  }, [collection, database, isConnect, update]);

  const collectionData = useMemo(() => data?.data ?? [], [data]);

  return { collection: collectionData, isFetching, update };
};

export default useCollection;
