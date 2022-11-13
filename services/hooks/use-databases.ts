import { useEffect, useMemo } from "react";
import useService from "../../hooks";
import { useAppSelector } from "../../store/hooks";
import { getDatabases } from "../database";

interface ReturnValues {
  databases: Array<{ name: string }>;
  isFetching: boolean;
}


const useDatabases = function useDatabases(): ReturnValues {
  const { uri, isConnect } = useAppSelector(
    (state) => state.connection
  );
  const {
    data,
    fetch,
    isFetching,
  } = useService({
    initialData: {},
    service: getDatabases,
  });

  useEffect(() => {
    if (!isConnect) {
      return;
    }

    fetch({ uri });
  }, [fetch, isConnect, uri]);

  const databases = useMemo(() => data?.data ?? [], [data]);

  return { databases, isFetching };
};

export default useDatabases;
