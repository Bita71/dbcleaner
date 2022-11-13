import { ChangeEvent, useEffect, useMemo } from "react";
import Head from "next/head";
import { Typography, TextField, Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Layout } from "../components";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setConnect, setUri } from "../store/connection";
import { connectDB } from "../services/connecting";
import useService from "../hooks";

export default function Home() {
  const { data, fetch, isFetching, error } = useService({
    initialData: {},
    service: connectDB,
  });
  const { uri, isConnect } = useAppSelector((state) => state.connection);
  const dispatch = useAppDispatch();

  const handleDbUriChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setUri(event.target?.value?.trim()));
  };
  const handleConnectClick = () => {
    fetch({ uri });
  };

  const errorMessage = useMemo(() => {
    if (!error) {
      return '';
    }

    return error.response?.data?.message || ''
  }, [error])

  useEffect(() => {
    if (data && data.message === 'Подключено') {
      dispatch(setConnect(true));
    }
  }, [data, dispatch]);

  const handleDisconnectClick = () => {
    dispatch(setConnect(false));
  };
  return (
    <div>
      <Head>
        <title>Подключение</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <h2 className="title">
          {isConnect ? "Вы подключены к серверу" : "Подключите ваш сервер"}
        </h2>
        {!isConnect && (
          <Typography component="p" marginBottom={4}>
            В поле ниже вставьте ссылку на подключение к серверу.
          </Typography>
        )}
        <Box marginBottom={4}>
          <TextField
            style={{ background: "white" }}
            error={Boolean(errorMessage)}
            helperText={errorMessage}
            value={uri}
            onChange={handleDbUriChange}
            label="mongodb://"
            variant="outlined"
            sx={{ width: 700 }}
            disabled={isConnect || isFetching}
          />
        </Box>
        <LoadingButton
          onClick={isConnect ? handleDisconnectClick : handleConnectClick}
          size="large"
          color={isConnect ? "error" : "success"}
          loading={isFetching}
          variant="contained"
          disabled={!isConnect && !uri.length}
        >
          {isConnect ? "Отключиться" : "Подключиться"}
        </LoadingButton>
      </Layout>

      <style jsx>{`
        .title {
          font-size: 3em;
        }
      `}</style>
    </div>
  );
}
