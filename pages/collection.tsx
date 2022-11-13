import Head from "next/head";
import { Button, CircularProgress, Tab, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { GridCellExpand, Layout } from "../components";
import { useAppSelector } from "../store/hooks";
import Link from "next/link";
import useCollection from "../services/hooks/use-collection";
import { useMemo, useState } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";

function renderCellExpand(params: GridRenderCellParams<string>) {
  return (
    <GridCellExpand
      value={params.value || ""}
      width={params.colDef.computedWidth}
    />
  );
}

export default function Collection() {
  const [view, setView] = useState("table");
  const { isConnect, collection } = useAppSelector((state) => state.connection);

  const { isFetching, collection: collectionData } = useCollection();

  const isEmptyCollection = collectionData.length === 0;

  const columns: GridColDef[] = useMemo(() => {
    if (isEmptyCollection) {
      return [];
    }

    return Object.keys(collectionData[0])
      .filter((key) => key !== "_id")
      .map((key) => ({
        field: key,
        headerName: key,
        editable: true,
        width: 200,

        renderCell: renderCellExpand,
      }));
  }, [collectionData, isEmptyCollection]);

  const rows = useMemo(() => {
    if (isEmptyCollection) {
      return [];
    }

    return collectionData.map((item) => {
      const mappedRow: Record<string, any> = Object.keys(item).reduce(
        (acc, key) => {
          if (typeof item[key] == "function" || typeof item[key] === "object") {
            return { ...acc, [key]: JSON.stringify(item[key]) };
          }
          return {
            ...acc,
            [key]: item[key],
          };
        },
        {}
      );
      return { ...mappedRow, id: mappedRow["_id"] };
    });
  }, [collectionData, isEmptyCollection]);

  const json = useMemo(() => JSON.stringify(collectionData), [collectionData]);

  const handleViewChange = (event: React.SyntheticEvent, newValue: string) => {
    setView(newValue);
  };
  return (
    <div>
      <Head>
        <title>Коллекция {collection}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!isConnect && (
        <Layout>
          <h2 className="title">Сервер не подключен</h2>
          <Link href="/connect" className="button">
            <Button
              size="large"
              className="button"
              color="primary"
              variant="contained"
            >
              Подключить
            </Button>
          </Link>
        </Layout>
      )}

      {isConnect && (
        <Layout>
          <h2 className="title">Коллекция {collection}</h2>
          {isFetching && <CircularProgress size={20} />}

          {!isFetching && (
            <>
              {isEmptyCollection && (
                <Typography>Коллекция не имеет ни одной записи</Typography>
              )}

              {!isEmptyCollection && (
                <>
                  <TabContext value={view}>
                    <TabList
                      sx={{ width: "min-content", margin: "0 auto" }}
                      onChange={handleViewChange}
                    >
                      <Tab label="Таблица" value="table" />
                      <Tab label="JSON" value="json" />
                    </TabList>
                    <TabPanel value="table">
                      <DataGrid
                        autoHeight
                        sx={{ width: 1000 }}
                        rows={rows}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                        showCellRightBorder
                      />
                    </TabPanel>
                    <TabPanel
                      sx={{
                        width: 1000,
                        height: 500,
                        overflow: "scroll",
                        padding: "1em",
                        borderRadius: ".5em",
                        background: "rgba(0, 0, 0, 0.1)",
                        textAlign: "left",
                      }}
                      value="json"
                    >
                      <code>{json}</code>
                    </TabPanel>
                  </TabContext>
                </>
              )}
            </>
          )}
        </Layout>
      )}
      <style jsx>{`
        .title {
          font-size: 3em;
        }
      `}</style>
    </div>
  );
}
