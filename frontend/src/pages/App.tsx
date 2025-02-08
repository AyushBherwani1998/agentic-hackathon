import "../App.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  createSmartSession,
  delegateToSafe,
} from "../services/rhinestoneHandler.ts";

import PromptInput from "../components/PromptInput.tsx"
import { useState } from "react";
import { PromptTransfer } from "../components/PromptTransfer.tsx";
import  Header  from "../components/Header.tsx"
import PrimaryButton from "../components/PrimaryButton.tsx";
import Eliza from "../components/eliza.tsx";
import PromptCreateToken from "../components/PromptCreateToken.tsx";

function App() {
  const { login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [inputValue, setInputValue] = useState<string>("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showEliza, setShowEliza] = useState(false);
  const [showCreateToken, setShowCreateToken] = useState(false);
  let buttonOnClick;


  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleSubmit = () => {
    console.log("Submit clicked, current input:", inputValue);
    if (inputValue === "/transfer") {
      setShowTransfer(true);
      setInputValue("");
    } else if (inputValue === "/create-your-token") {
      setShowCreateToken(true);
      setInputValue("");
    }
  };

  const handleElizaClick = () => {
    setShowEliza(true);
  };

  const renderContent = () => {
    let ContentComponent;

    if (showTransfer) {
      ContentComponent = <PromptTransfer />;
      buttonOnClick = handleElizaClick;
    } else if (showCreateToken) {
      ContentComponent = <PromptCreateToken />;
      buttonOnClick = handleElizaClick;
    } else {
      ContentComponent = <PromptInput onInputChange={handleInputChange} />;
      buttonOnClick = handleSubmit;
    }
    return (
      <div>
        {ContentComponent}
        
      </div>
    );
  };

  return (
    <>
    <Header/>
      <div className=" flex w-screen px-56 pt-24">
        
        {renderContent()}
        {/* {showEliza && <Eliza />} to be modified on basis of the flow */}
      </div>
      <div className="flex w-screen px-56 justify-end pt-40">
        
        {/* keyevent is not working */}
        <PrimaryButton text={showTransfer || showCreateToken ? "Ask Eliza" : "Submit"} 
                        keyShortcut="⌘E" 
                        keyEvent="Command+E" 
                        className="z-2"
                        onClick={buttonOnClick} 
                        /> 
      </div>
     

    <button 
          onClick={buttonOnClick}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {showTransfer || showCreateToken ? "Ask Eliza" : "Submit"}
        </button>

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
      <img src="./bottom-img.png" className="bottom-image"></img>
    </>
  );
}

export default App;
