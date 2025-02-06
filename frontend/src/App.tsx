import "./App.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  createSmartSession,
  delegateToSafe,
} from "./services/rhinestoneHandler";

import PromptInput from "./components/PromptInput"
import { useState } from "react";
import { PromptTransfer } from "./components/PromptTransfer";
import Eliza from "./components/eliza";

function App() {
  const { login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [inputValue, setInputValue] = useState<string>("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showEliza, setShowEliza] = useState(false);

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleSubmit = () => {
    console.log("Submit clicked, current input:", inputValue);
    if (inputValue === "/transfer") {
      setShowTransfer(true);
    }
  };

  const handleElizaClick = () => {
    setShowEliza(true);
  };

  return (
    <>
      {showTransfer ? (
        <div>
        <PromptTransfer />
        <button 
            onClick={handleElizaClick}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Ask Eliza
          </button>
          </div>
      ) : (
        <div>
          <PromptInput onInputChange={handleInputChange} />
          <button 
            onClick={handleSubmit}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
        </div>
      )}
      
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
      {showEliza && <Eliza />}
    </>
  );
}

export default App;
