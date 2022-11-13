import Head from "next/head";
import Link from "next/link";
import { Layout } from "../components";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Typography,
  TextField,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setCollection,
  setConnect,
  setDatabase,
  setUri,
} from "../store/connection";
import { useCollections, useDatabases } from "../services";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { LoadingButton } from "@mui/lab";
import useService from "../hooks";
import { connectDB } from "../services/connecting";
import { CSSTransition } from "react-transition-group";

export default function Home() {
  const dispatch = useAppDispatch();
  const { uri, database, collection, isConnect } = useAppSelector(
    (state) => state.connection
  );

  const handleDatabaseChange = (event: SelectChangeEvent) => {
    dispatch(setDatabase(event.target.value));
  };

  const handleCollectionChange = (event: SelectChangeEvent) => {
    dispatch(setCollection(event.target.value));
  };

  const { databases, isFetching: isFetchingDatabases } = useDatabases();
  const { collections, isFetching: isFetchingCollections } = useCollections();

  const {
    data,
    fetch,
    isFetching: isConnecting,
    error,
  } = useService({
    initialData: {},
    service: connectDB,
  });

  const handleDbUriChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setUri(event.target?.value?.trim()));
  };
  const handleConnectClick = () => {
    fetch({ uri });
  };

  const errorMessage = useMemo(() => {
    if (!error) {
      return "";
    }

    return error.response?.data?.message || "";
  }, [error]);

  useEffect(() => {
    if (data && data.message) {
      setSecondIn(false);
      dispatch(setConnect(true));
    }
  }, [data, dispatch]);

  const isFetching = isFetchingCollections || isFetchingDatabases;

  const refNotStarted = useRef(null);
  const refStarted = useRef(null);
  const refConnected = useRef(null);

  const [firstIn, setFirstIn] = useState(!isConnect);
  const [secondIn, setSecondIn] = useState(false);
  const [thirdIn, setThirdIn] = useState(isConnect);

  const handleStartClick = () => setFirstIn(false);

  return (
    <div>
      <Head>
        <title>DBCleaner</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <CSSTransition
          nodeRef={refNotStarted}
          in={firstIn}
          timeout={500}
          unmountOnExit
          classNames="my-node"
          onExited={() => setSecondIn(true)}
        >
          <div ref={refNotStarted}>
            <h2 className="title">Добро пожаловать!</h2>
            <p className="text">Это проект, который очистит твою базу данных от перекрытий, дублей и отсутствующих данных</p>
            <Button
              size="large"
              className="button"
              color="primary"
              variant="contained"
              onClick={handleStartClick}
            >
              Начать
            </Button>
          </div>
        </CSSTransition>

        <CSSTransition
          nodeRef={refStarted}
          in={secondIn}
          timeout={500}
          unmountOnExit
          classNames="my-node"
          onExited={() => setThirdIn(true)}
        >
          <div ref={refStarted}>
            <h2 className="title">Подключите ваш сервер </h2>
            <Typography component="p" marginBottom={4}>
              В поле ниже вставьте ссылку на подключение к серверу.
            </Typography>
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
                disabled={isConnecting}
              />
            </Box>
            <LoadingButton
              onClick={handleConnectClick}
              size="large"
              color={"success"}
              loading={isConnecting}
              variant="contained"
              disabled={!uri.length}
            >
              Подключиться
            </LoadingButton>
          </div>
        </CSSTransition>

        <CSSTransition
          nodeRef={refConnected}
          in={thirdIn}
          timeout={500}
          unmountOnExit
          classNames="my-node"
        >
          <div ref={refConnected}>
            <div>
              <h2 className="title">Начнем!</h2>
              {!isFetchingDatabases && (
                <Box sx={{ width: 400, margin: "0 auto 2em auto" }}>
                  {databases.length > 0 ? (
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        База данных
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={database}
                        label="База данных"
                        onChange={handleDatabaseChange}
                      >
                        {databases.map((item) => (
                          <MenuItem key={item.name} value={item.name}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography>Не нашлось ни одной базы данных</Typography>
                  )}
                </Box>
              )}
              {Boolean(database) && !isFetchingCollections && (
                <Box sx={{ width: 400, margin: "0 auto 3em auto" }}>
                  <>
                    {collections.length > 0 ? (
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label-2">
                          Коллекция
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label-2"
                          id="demo-simple-select"
                          value={collection}
                          label="Коллецкия"
                          onChange={handleCollectionChange}
                        >
                          {collections.map((item) => (
                            <MenuItem key={item.name} value={item.name}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography>Не нашлось ни одной коллекции</Typography>
                    )}
                  </>
                </Box>
              )}
            </div>
            {isFetching && <CircularProgress size={20} />}
            {collection && !isFetching && (
              <Box display="flex" justifyContent="space-between" gap={2}>
                <Link href="/check">
                  <Button variant="contained" size="large" color="primary">
                    Проверить коллекцию
                  </Button>
                </Link>
                <Link href="/collection">
                  <Button variant="contained" size="large" color="primary">
                    Показать коллекцию
                  </Button>
                </Link>
              </Box>
            )}
          </div>
        </CSSTransition>
      </Layout>

      <style jsx>{`
        .title {
          font-size: 4em;
        }

        .text {
          margin-bottom: 3em;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        img {
          max-width: 100%;
          height: auto;
        }

        ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        a {
          display: block;
          text-decoration: none;
        }

        button {
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        input {
          &[type="text"]::-ms-clear,
          &[type="text"]::-ms-reveal {
            display: none;
            width: 0;
            height: 0;
          }
          &[type="search"]::-webkit-search-decoration,
          &[type="search"]::-webkit-search-cancel-button,
          &[type="search"]::-webkit-search-results-button,
          &[type="search"]::-webkit-search-results-decoration {
            display: none;
          }

          &::-webkit-outer-spin-button,
          &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        }

        form {
          margin: 0;
        }

        .visually-hidden {
          position: absolute;
          display: inline-block;
          border: 0;
          width: 1px;
          height: 1px;
          margin: 0;
          padding: 0;
          font-size: 0;
          overflow: hidden;
          clip: rect(1px, 1px, 1px, 1px);
        }

        .my-node-enter {
          opacity: 0;
        }
        .my-node-enter-active {
          opacity: 1;
          transition: opacity 500ms;
        }
        .my-node-exit {
          opacity: 1;
        }
        .my-node-exit-active {
          opacity: 0;
          transition: opacity 500ms;
        }
      `}</style>
    </div>
  );
}
