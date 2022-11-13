import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store";
import { useMemo } from "react";
import { useTheme } from "@emotion/react";
import { ruRU } from "@mui/material/locale";
import { createTheme, ThemeProvider } from "@mui/material";

export default function App({ Component, pageProps }: AppProps) {

  const theme = useTheme();

  const themeWithLocale = useMemo(() => createTheme(theme, ruRU), [theme]);

  return (
    <ThemeProvider theme={themeWithLocale}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </ThemeProvider>
  );
}
