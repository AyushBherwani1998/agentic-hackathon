import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PrivyProvider } from "@privy-io/react-auth";
import { odysseyTestnet } from "viem/chains";
import { DmkConfigProvider } from "./providers/LedgerDmkConfigProvider.tsx";
import { DmkProvider } from "./providers/LedgerDmkProvider.tsx";
import { DeviceSessionsProvider } from "./providers/LedgerSessionProvider.tsx";
import { SignerEthProvider } from "./providers/LedgerSignerProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DmkConfigProvider>
      <DmkProvider>
        <DeviceSessionsProvider>
          <SignerEthProvider>
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
      <App />
    </PrivyProvider>
          </SignerEthProvider>
        </DeviceSessionsProvider>  
      </DmkProvider>  
    </DmkConfigProvider>

  </StrictMode>
);
