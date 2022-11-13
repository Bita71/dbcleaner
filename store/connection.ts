import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { connectDB } from "../services/connecting";

// Define a type for the slice state
interface ConnectionState {
  uri: string;
  isConnect: boolean;
  database: string;
  collection: string;
}

// Define the initial state using that type
const initialState: ConnectionState = {
  uri: "",
  isConnect: false,
  database: "",
  collection: "",
};

export const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setUri: (state, action: PayloadAction<string>) => {
      state.uri = action.payload;
    },
    setConnect: (state, action: PayloadAction<boolean>) => {
      const isConnect = action.payload;
      state.isConnect = isConnect;
      state.database = "";
      state.collection = "";
      if (!isConnect) {
        state.uri = "";
      }
    },
    setDatabase: (state, action: PayloadAction<string>) => {
      state.database = action.payload;
      state.collection = '';
    },
    setCollection: (state, action: PayloadAction<string>) => {
      state.collection = action.payload;
    },
  },
});

export const {
  setUri,
  setConnect,
  setCollection,
  setDatabase,
} = connectionSlice.actions;

export default connectionSlice.reducer;
