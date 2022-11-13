import React from "react";
import Link from "next/link";
import { useAppSelector } from "../../store/hooks";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";

const Header = function Header() {
  const isConnect = useAppSelector((state) => state.connection.isConnect);

  const router = useRouter();

  const isMainPage = router.pathname === "/";

  return (
    <header>
      {!isMainPage && (
        <Link href="/">
          <Button startIcon={<ArrowBackIcon />}>На главную</Button>
        </Link>
      )}
      <h1 className="title">
        <Link href="/">DBCleaner</Link>
      </h1>

      {isConnect && (
        <Link href="/connect">
          <Button variant="contained" color="success">
            Подключено
          </Button>
        </Link>
      )}

      <style jsx>{`
        header {
          display: grid;
          align-items: center;
          grid-template-columns: repeat(6, 1fr);
          justify-content: center;
          position: absolute;
          top: 0;
          padding: 1em;
          text-align: center;
          width: 100%;
          z-index: 5;
        }

        .title {
          grid-column: 2/6;
        }
      `}</style>
    </header>
  );
};

export default Header;
