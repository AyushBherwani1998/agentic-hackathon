import "../App.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import PromptInput from "../components/PromptInput.tsx";
import { useState } from "react";
import { PromptTransfer } from "../components/PromptTransfer.tsx";
import Header from "../components/Header.tsx";
import PrimaryButton from "../components/PrimaryButton.tsx";
import PromptCreateToken from "../components/PromptCreateToken.tsx";
import { executeTransferQuery } from "../services/elisaHandler.ts";
import Loader from "../components/Loader.tsx";
import { useNavigate } from "react-router-dom";

function App() {
  const { login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [inputValue, setInputValue] = useState<string>("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showEliza, setShowEliza] = useState(false);
  const [showCreateToken, setShowCreateToken] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  let buttonOnClick;

  const navigate = useNavigate();

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const onExecute = async () => {
    console.log("Execute transfer clicked, current input:", inputValue);
    setShowLoader(true);
    const response = await executeTransferQuery(
      `Transfer 0.0001 to 0xDC5aFb5DE928bAc740e4bcB1600B93504560d850 on odysseyTestnet`,
      wallets[0],
      "0xDC5aFb5DE928bAc740e4bcB1600B93504560d850"
    );
    console.log("Response: ", response);
    setShowLoader(false);
    navigate("/loading");
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
    return <div>{ContentComponent}</div>;
  };

  return (
    <>
      <Header />
      {showLoader && <Loader />}

      {!showLoader && (
        <>
          <div className=" flex w-screen px-56 pt-24">{renderContent()}</div>
          <div className="flex w-screen px-56 justify-end pt-40">
            {/* keyevent is not working */}
            <PrimaryButton
              text={showTransfer || showCreateToken ? "Ask Eliza" : "Submit"}
              keyShortcut="⌘E"
              keyEvent="Command+E"
              className="z-2"
              onClick={onExecute}
            />
            <PrimaryButton
              text="Logout"
              keyShortcut="⌘E"
              keyEvent="Command+E"
              className="z-2"
              onClick={logout}
            />
          </div>
        </>
      )}
      <img src="./bottom-img.png" className="bottom-image"></img>
    </>
  );
}

export default App;
