import axios from "axios";

interface GetCollectionsProps {
  uri: string;
  database: string;
}

export const getCollections = ({ uri, database }: GetCollectionsProps) =>
  axios
    .post("/api/collections", {
      uri,
      database,
    })
    .then((response) => response?.data);

interface ShowCollectionsProps {
  uri: string;
  database: string;
  collection: string;
}
export const showCollection = ({
  uri,
  database,
  collection,
}: ShowCollectionsProps) =>
  axios
    .post("/api/showCollection", {
      uri,
      database,
      collection,
    })
    .then((response) => response?.data);

interface OrderCollectionsProps {
  uri: string;
  database: string;
  collection: string;
  order: string[];
}
export const orderCollection = ({
  uri,
  database,
  collection,
  order,
}: OrderCollectionsProps) =>
  axios
    .post("/api/orderCollection", {
      uri,
      database,
      collection,
      order,
    })
    .then((response) => response?.data);

interface DeleteFromCollectionsProps {
  uri: string;
  database: string;
  collection: string;
  ids: string[];
}

export const deleteFromCollection = ({
  uri,
  database,
  collection,
  ids,
}: DeleteFromCollectionsProps) =>
  axios
    .post("/api/deleteFromCollection", {
      uri,
      database,
      collection,
      ids,
    })
    .then((response) => response?.data);

interface EditCollectionsProps {
  uri: string;
  database: string;
  collection: string;
  updateObj: Record<string, Record<string, any>>;
}

export const editCollection = ({
  uri,
  database,
  collection,
  updateObj,
}: EditCollectionsProps) =>
  axios
    .post("/api/editCollection", {
      uri,
      database,
      collection,
      updateObj,
    })
    .then((response) => response?.data);
