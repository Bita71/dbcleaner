import { useCallback } from "react";
import useService from "../../hooks";
import { useAppSelector } from "../../store/hooks";
import { deleteFromCollection as apiDeleteFromCollection } from "../collection";

interface ReturnValues {
  deleteFromCollection: (order: string[]) => void;
  isFetching: boolean;
  data: { message: string };
}

const useDeleteFromCollection = function useDeleteFromCollection(): ReturnValues {
  const { uri, database, collection, isConnect } = useAppSelector(
    (state) => state.connection
  );
  const { data, fetch, isFetching } = useService({
    initialData: {},
    service: apiDeleteFromCollection,
  });

  const deleteFromCollection = useCallback(
    (ids: string[]) => {
      if (!isConnect || !database || !collection) {
        return;
      }
      fetch({ uri, database, collection, ids });
    },
    [collection, database, fetch, isConnect, uri]
  );

  return { deleteFromCollection, isFetching, data };
};

export default useDeleteFromCollection;
