import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { AppProps } from "next/app";
import { Header } from "../components/Header";
import "../styles/global.scss";

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{
  session: Session;
}>) {
  return (
    <>
      <SessionProvider session={session}>
        <Header />
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
