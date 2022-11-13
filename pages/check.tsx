import Head from "next/head";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Layout, GridCellExpand, Step as StepView } from "../components";
import { useAppSelector } from "../store/hooks";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useCollection,
  useOrderCollection,
  useDeleteFromCollection,
} from "../services";
import {
  DataGrid,
  GridCellParams,
  GridColumns,
  GridEventListener,
  GridRenderCellParams,
  GridRowsProp,
} from "@mui/x-data-grid";
import useEditCollection from "../services/hooks/use-edit-collection";

const checkEditedObj = (obj: Record<string, Record<string, any>>) =>
  Object.keys(obj).every((key) =>
    Object.keys(obj[key]).every((childKey) => obj[key][childKey])
  );

const steps = ["Перекрытие данных", "Дубликаты данных", "Отсутствие"];

type TOrders = Record<string, number>;
type TDuplicates = {
  rows: GridRowsProp;
  columns: GridColumns;
};

type TLosts = {
  rows: GridRowsProp;
  columns: GridColumns;
};

function renderCellExpand(params: GridRenderCellParams<string>) {
  return (
    <GridCellExpand
      value={params.value || ""}
      width={params.colDef.computedWidth}
    />
  );
}

function renderCellExpandWithErrors(params: GridRenderCellParams<string>) {
  return (
    <GridCellExpand
      value={params.value || ""}
      width={params.colDef.computedWidth}
      showNullError
    />
  );
}

export default function Check() {
  const { isConnect, collection } = useAppSelector((state) => state.connection);
  const { isFetching, collection: collectionData, update } = useCollection();
  const {
    isFetching: isFetchingOrder,
    orderCollection,
    data: dataOrder,
  } = useOrderCollection();
  const {
    isFetching: isFetchingDelete,
    deleteFromCollection,
    data: dataDelete,
  } = useDeleteFromCollection();
  const {
    isFetching: isFetchingEdit,
    edit,
    data: dataEdit,
  } = useEditCollection();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [completedSteps, setCompletedSteps] = useState(new Set<number>([]));
  const [startedSteps, setStartedSteps] = useState(new Set<number>([]));
  const [orders, setOrders] = useState<TOrders>({});
  const [duplicates, setDuplicates] = useState<TDuplicates>({
    rows: [],
    columns: [],
  });
  const [losts, setLosts] = useState<TLosts>({
    rows: [],
    columns: [],
  });
  const [edited, setEdited] = useState<Record<string, Record<string, any>>>({});

  const handleNext = () => {
    update();
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    update();
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStartFirst = () => {
    setStartedSteps((prev) => new Set(prev).add(0));
    const map: TOrders = {};
    collectionData.forEach((row) => {
      const order = Object.keys(row)
        .filter((key) => key !== "_id")
        .join(", ");
      if (!map[order]) {
        map[order] = 0;
      }
      map[order] += 1;
    });
    setOrders(map);

    if (Object.keys(map).length > 1) {
      setOrders(map);
    } else {
      setCompletedSteps((prev) => new Set(prev).add(0));
    }
  };

  const handleResetFirst = () => {
    setCompletedSteps(
      (prev) => new Set(Array.from(prev).filter((item) => item !== 0))
    );
    handleStartFirst();
  };

  const handleApplyOrder = () => {
    orderCollection(selectedOrder.split(", "));
  };

  const handleStartSecond = () => {
    setStartedSteps((prev) => new Set(prev).add(1));
    const map: Record<string, string[]> = {};
    collectionData.forEach((row) => {
      const newRow = JSON.stringify(
        Object.keys(row)
          .filter((key) => key !== "_id")
          .reduce((acc, curr) => ({ ...acc, [curr]: row[curr] }), {})
      );

      if (!map[newRow]) {
        map[newRow] = [];
      }
      map[newRow].push(row["_id"]);
    });

    if (Object.values(map).some((item) => item.length > 1)) {
      const rows = Object.keys(map)
        .filter((key) => map[key].length > 1)
        .map((key, index) => {
          const row = JSON.parse(key);
          const mappedRow: Record<string, any> = Object.keys(row).reduce(
            (acc, key) => {
              if (
                typeof row[key] == "function" ||
                typeof row[key] === "object"
              ) {
                return { ...acc, [key]: JSON.stringify(row[key]) };
              }
              return {
                ...acc,
                [key]: row[key],
              };
            },
            {}
          );
          return {
            id: index,
            ids: JSON.stringify(map[key]),
            ...mappedRow,
          };
        });
      const columns = Object.keys(rows[0])
        .filter((key) => key !== "id")
        .map((key) => ({
          field: key,
          headerName: key,
          width: 200,
          renderCell: renderCellExpand,
        }));
      setDuplicates({ rows, columns });
    } else {
      setCompletedSteps((prev) => new Set(prev).add(1));
    }
  };

  const handleDeleteDuplicates = () => {
    const ids: string[] = [];

    duplicates.rows.forEach((row) => {
      ids.push(...JSON.parse(row.ids).slice(1));
    });
    deleteFromCollection(ids);
  };

  const handleResetSecond = () => {
    setCompletedSteps(
      (prev) => new Set(Array.from(prev).filter((item) => item !== 1))
    );
    handleStartSecond();
  };

  const handleStartThird = () => {
    setStartedSteps((prev) => new Set(prev).add(2));

    if (collectionData.every((row) => Object.values(row).every(Boolean))) {
      setCompletedSteps((prev) => new Set(prev).add(2));
      return;
    }
    const editedObj: Record<string, Record<string, null>> = {};
    const rows: GridRowsProp = collectionData.reduce(
      (acc, row: Record<string, any>) => {
        if (Object.values(row).every(Boolean)) {
          return acc;
        }
        const editedObjRow: Record<string, null> = {};
        const newRow: Record<string, any> = Object.keys(row).reduce(
          (accRow, key) => {
            if (!row[key]) {
              editedObjRow[key] = null;
            }
            if (
              row[key] &&
              (typeof row[key] === "function" || typeof row[key] === "object")
            ) {
              return { ...accRow, [key]: JSON.stringify(row[key]) };
            }
            return { ...accRow, [key]: row[key] };
          },
          {}
        );
        editedObj[newRow["_id"]] = editedObjRow;
        return [...acc, { ...newRow, id: newRow["_id"] }];
      },
      []
    );

    setEdited(editedObj);

    const columns: GridColumns = Object.keys(rows[0])
      .filter((key) => key !== "_id" && key !== "id")
      .map((key) => ({
        field: key,
        headerName: key,
        width: 200,
        renderCell: renderCellExpandWithErrors,
        editable: true,
      }));

    setLosts({ rows, columns });
  };

  const handleCellEditCommit: GridEventListener<"cellEditCommit"> = (
    params
  ) => {
    const { id, field, value } = params;
    setEdited((state) => ({
      ...state,
      [id]: { ...state[id], [field]: value },
    }));
  };

  const handleSaveEdited = () => {
    if (!checkEditedObj(edited)) {
      return;
    }

    edit(edited);
  };

  const handleResetThird = () => {
    setCompletedSteps(
      (prev) => new Set(Array.from(prev).filter((item) => item !== 2))
    );
    handleStartThird();
  };


  useEffect(() => {
    if (dataOrder?.message === "Успешно") {
      update();
      setCompletedSteps((prev) => new Set(prev).add(0));
    }
  }, [dataOrder, update]);

  useEffect(() => {
    if (dataDelete?.message === "Успешно") {
      update();
      setCompletedSteps((prev) => new Set(prev).add(1));
    }
  }, [dataDelete, update]);

  useEffect(() => {
    if (dataEdit?.message === "Успешно") {
      update();
      setCompletedSteps((prev) => new Set(prev).add(2));
    }
  }, [dataEdit, update]);


  const handleSelectedOrderChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedOrder(event.target.value);
  };

  const isStepFailed = (step: number) => {
    return startedSteps.has(step) && !completedSteps.has(step);
  };

  const isCellEditable = (params: GridCellParams) => {
    const id = params.rowNode.id;
    const field = params.field;
    return edited[id] && field in edited[id];
  };

  const isAllLostFull = useMemo(() => {
    return checkEditedObj(edited);
  }, [edited]);

  return (
    <div>
      <Head>
        <title>Проверка</title>
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: 1000,
              height: 600,
            }}
          >
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                const labelProps: {
                  optional?: React.ReactNode;
                  error?: boolean;
                } = {};
                if (isStepFailed(index)) {
                  labelProps.error = true;
                }

                return (
                  <Step key={label}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              sx={{ height: "100%", mt: 4 }}
            >
              {isFetching && <CircularProgress size={20} />}

              {!isFetching && (
                <>
                  {activeStep === 0 && (
                    <StepView
                      title="Проверка на перекрытие данных"
                      errorTitle="Найдено перекрытие данных"
                      completeTitle="Проверка пройдена, перекрытий данных не найдено ✅"
                      isCompleted={completedSteps.has(0)}
                      isStarted={startedSteps.has(0)}
                      isFetching={isFetchingOrder}
                      isButtonDisabled={!selectedOrder}
                      applyButtonText="Выбрать"
                      onStart={handleStartFirst}
                      onReset={handleResetFirst}
                      onApply={handleApplyOrder}
                    >
                      <FormControl>
                        <FormLabel id="demo-radio-buttons-group-label">
                          Выберете нужный порядок полей
                          {"(порядок - кол-во появлений)"}
                        </FormLabel>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          defaultValue="female"
                          value={selectedOrder}
                          onChange={handleSelectedOrderChange}
                          name="radio-buttons-group"
                          sx={{ maxHeight: 300, overflow: "scroll" }}
                        >
                          {Object.keys(orders)
                            .sort((a, b) => orders[b] - orders[a])
                            .map((key) => (
                              <FormControlLabel
                                sx={{ justifyContent: "center" }}
                                key={key}
                                value={key}
                                control={<Radio />}
                                label={`(${key}) - ${orders[key]}`}
                              />
                            ))}
                        </RadioGroup>
                      </FormControl>
                    </StepView>
                  )}
                  {activeStep === 1 && (
                    <StepView
                      title="Проверка на дублирование данных"
                      errorTitle="Найдено дублирование данных"
                      completeTitle="Проверка пройдена, дубли данных не найдены ✅"
                      isCompleted={completedSteps.has(1)}
                      isStarted={startedSteps.has(1)}
                      isFetching={isFetchingDelete}
                      applyButtonText="Удалить дубли"
                      onStart={handleStartSecond}
                      onReset={handleResetSecond}
                      onApply={handleDeleteDuplicates}
                    >
                      <DataGrid
                        autoHeight
                        sx={{ width: 1000 }}
                        rows={duplicates.rows}
                        columns={duplicates.columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection={false}
                        disableSelectionOnClick
                        showCellRightBorder
                      />
                    </StepView>
                  )}
                  {activeStep === 2 && (
                    <StepView
                      title="Проверка на отсутствие данных"
                      errorTitle="Найдено отсутствие данных"
                      completeTitle=" Проверка пройдена, отсутствие данных не найдено ✅"
                      isCompleted={completedSteps.has(2)}
                      isStarted={startedSteps.has(2)}
                      isFetching={isFetchingEdit}
                      isButtonDisabled={!isAllLostFull}
                      applyButtonText="Сохранить"
                      onStart={handleStartThird}
                      onReset={handleResetThird}
                      onApply={handleSaveEdited}
                    >
                      <DataGrid
                        autoHeight
                        sx={{ width: 1000 }}
                        rows={losts.rows}
                        columns={losts.columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        showCellRightBorder
                        hideFooterSelectedRowCount
                        onCellEditCommit={handleCellEditCommit}
                        isCellEditable={isCellEditable}
                      />
                    </StepView>
                  )}
                  {activeStep === steps.length && (
                    <Typography fontSize="1em" sx={{ mt: "auto", mb: "auto" }}>
                      Поздравляем! Коллекция <b>{collection}</b> полностью
                      проверена и исправлена ✅
                    </Typography>
                  )}
                </>
              )}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Назад
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              {activeStep !== steps.length && <Button
                onClick={handleNext}
                disabled={!completedSteps.has(activeStep)}
              >
                {activeStep === steps.length - 1 ? "Закончить" : "Дальше"}
              </Button>}
            </Box>
          </Box>
        </Layout>
      )}
      <style jsx>{`
        .cellError {
          background-color: red;
        }
      `}</style>
    </div>
  );
}
