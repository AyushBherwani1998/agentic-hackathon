import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { signMessage, signAuthorization } from "./services/privyHandler";
import { delegateToSafe } from "./services/rhinestoneHandler";

function App() {
  const [count, setCount] = useState(0);
  const { login, logout } = usePrivy();
  const { wallets } = useWallets();

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
            const signature = await delegateToSafe(wallet);
            console.log(signature);
          }}
        >
          sign message
        </button>
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
