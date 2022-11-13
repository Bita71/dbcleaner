import { useCallback } from "react";
import useService from "../../hooks";
import { useAppSelector } from "../../store/hooks";
import { editCollection } from "../collection";

interface ReturnValues {
  edit: (order: Record<string, Record<string, any>>) => void;
  isFetching: boolean;
  data: { message: string };
}

const useEditCollection = function useEditCollection(): ReturnValues {
  const { uri, database, collection, isConnect } = useAppSelector(
    (state) => state.connection
  );
  const { data, fetch, isFetching } = useService({
    initialData: {},
    service: editCollection,
  });

  const edit = useCallback(
    (updateObj: Record<string, Record<string, any>>) => {
      if (!isConnect || !database || !collection) {
        return;
      }
      const newObj = Object.keys(updateObj).reduce(
        (acc, id) => ({
          ...acc,
          [id]: Object.keys(updateObj[id]).reduce(
            (accChild, field) => ({
              ...accChild,
              [field]: JSON.parse(updateObj[id][field]),
            }),
            {}
          ),
        }),
        {}
      );
      fetch({ uri, database, collection, updateObj: newObj });
    },
    [collection, database, fetch, isConnect, uri]
  );

  return { edit, isFetching, data };
};

export default useEditCollection;
