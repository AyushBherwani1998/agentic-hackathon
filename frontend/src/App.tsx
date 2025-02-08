import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  createSmartSession,
  delegateToSafe,
} from "./services/rhinestoneHandler";
import { webBleIdentifier } from "@ledgerhq/device-transport-kit-web-ble";

import { useDmk } from "./providers/LedgerDmkProvider";
import { DiscoveredDevice } from "@ledgerhq/device-management-kit";
import { useDeviceSessionsContext } from "./providers/LedgerSessionProvider";
import { useSignerEth } from "./providers/LedgerSignerProvider";

function App() {
  const { login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { dispatch: dispatchDeviceSession } = useDeviceSessionsContext();
  const dmk = useDmk();
  const signerEth  = useSignerEth();

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => login()}>Login</button>
        <button onClick={() => logout()}> Logout </button>
        <button
          onClick={async () => {
            const wallet = wallets[0];
            console.log(wallet);

            const delegateReceipt = await delegateToSafe(wallet);
            console.log(delegateReceipt);

            const sessionReceipt = await createSmartSession(wallet);
            console.log(sessionReceipt);
          }}
        >
          sign message
        </button>
        <button onClick={() => {
          dmk.startDiscovering({transport: webBleIdentifier}).subscribe({
            next: (device: DiscoveredDevice) => {
              dmk.connect({device}).then((sessionId) => {
                const connectedDevice = dmk.getConnectedDevice({ sessionId });
                console.log('connected device: ', connectedDevice.id);
              });
            },
            error: (error: Error) => {
              console.error(error);
            },
          });
        }}>Connect hardware wallet</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
