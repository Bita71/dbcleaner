import axios from "axios";

interface GetDatabasesProps {
  uri: string;
}

export const getDatabases = ({ uri }: GetDatabasesProps) =>
  axios
    .post("/api/databases", {
      uri,
    })
    .then((response) => response?.data);
