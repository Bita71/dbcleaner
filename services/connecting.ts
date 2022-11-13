import axios from "axios";

interface ConnectDBProps {
  uri: string;
}

export const connectDB = ({ uri }: ConnectDBProps) =>
  axios
    .post("/api/connect", {
      uri,
    })
    .then((response) => response?.data);
