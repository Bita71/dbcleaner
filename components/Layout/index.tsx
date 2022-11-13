import { ReactNode } from "react";
import Header from "../Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = function Layout({ children }: LayoutProps) {
  return (
    <div className="container">
      <Header />
      <main>
        <div className="content">{children}</div>
      </main>

      <style jsx>{`
        main {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .container {
          height: 100vh;
        }

        .content {
          height: 100%;
          text-align: center;
          padding: 7.5em;
        }
      `}</style>
    </div>
  );
};

export default Layout;
