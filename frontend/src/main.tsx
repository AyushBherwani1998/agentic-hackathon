import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./pages/App.tsx";
import { PrivyProvider } from "@privy-io/react-auth";
import { odysseyTestnet } from "viem/chains";
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import Landing from "./pages/Landing.tsx";
import Loading from "./pages/AfterQuery.tsx";

const router=createBrowserRouter([{
  path:"/",
  element: <App/>
},{
  path:"/landing",
  element:<Landing/>
},{
  path:"/loading",
  element:<Loading/>
}
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
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
      <RouterProvider router={router}/>
    </PrivyProvider>
  </StrictMode>
);
