import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./pages/Home.tsx";
import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { odysseyTestnet } from "viem/chains";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Landing from "./pages/Landing.tsx";
import Loading from "./pages/AfterQuery.tsx";
import { isDelegatedToSafe } from "./services/rhinestoneHandler.ts";
import { Hex } from "viem";

export const router = createBrowserRouter([
  {
    path: "/app",
    element: <App />,
  },
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/loading",
    element: <Loading />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <PrivyProvider
    appId={import.meta.env.VITE_PRIVY_APP_ID}
    config={{
      loginMethods: ["email", "google", "wallet"],
      embeddedWallets: {
        createOnLogin: "users-without-wallets",
      },
      defaultChain: odysseyTestnet,
      supportedChains: [odysseyTestnet],
    }}
  >
    <RouterProvider router={router} />
    <MyComponent />
  </PrivyProvider>
);

export default function MyComponent() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  if (!ready) {
    return <></>;
  }
  if (ready && !authenticated) {
    router.navigate("/");
  }

  if (ready && authenticated && wallets.length > 0) {
    router.navigate("/app");
  }
}
