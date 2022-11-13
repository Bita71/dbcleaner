import { useCallback } from "react";
import useService from "../../hooks";
import { useAppSelector } from "../../store/hooks";
import { orderCollection as apiOrderCollection } from "../collection";

interface ReturnValues {
  orderCollection: (order: string[]) => void;
  isFetching: boolean;
  data: { message: string };
}

const useOrderCollection = function useOrderCollection(): ReturnValues {
  const { uri, database, collection, isConnect } = useAppSelector(
    (state) => state.connection
  );
  const { data, fetch, isFetching } = useService({
    initialData: {},
    service: apiOrderCollection,
  });

  const orderCollection = useCallback(
    (order: string[]) => {
      if (!isConnect || !database || !collection) {
        return;
      }
      fetch({ uri, database, collection, order });
    },
    [collection, database, fetch, isConnect, uri]
  );

  return { orderCollection, isFetching, data };
};

export default useOrderCollection;
