import { type AppType } from "next/app";

import { api } from "Y/utils/api";

import "Y/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
