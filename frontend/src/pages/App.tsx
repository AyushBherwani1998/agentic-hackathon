import "../App.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import PromptInput from "../components/PromptInput.tsx";
import { useState } from "react";
import PromptTransfer from "../components/PromptTransfer.tsx";
import Header from "../components/Header.tsx";
import PrimaryButton from "../components/PrimaryButton.tsx";
// import PromptCreateToken from "../components/PromptCreateToken.tsx";
import { executeTransferQuery } from "../services/elisaHandler.ts";
import Loader from "../components/Loader.tsx";
import { useNavigate } from "react-router-dom";

function App() {
  const { wallets } = useWallets();
  const [inputValue, setInputValue] = useState<string>("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showEliza, setShowEliza] = useState(false);
  // const [showCreateToken, setShowCreateToken] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showInputPrompt, setShowInputPrompt] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const [TransferData, setTransferData] = useState({
    amount: "",
    transferAddress: "",
  });
  const [isValidated, setIsValidated] = useState(false);

  const [validationResults, setValidationResults] = useState({
    amount: false,
    transferAddress: false,
  });

  const handleValidation = () => {
    setIsValidated(true);
  };

  const navigate = useNavigate();

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  let buttonOnClick;

  // conditonal functions to render UI

  const onExecute = async () => {
    console.log("Execute transfer clicked, current input:", inputValue);
    console.log(TransferData.amount);
    console.log(TransferData.transferAddress);
    // setShowTransfer(true);
    const response = await executeTransferQuery(
      `Transfer 0.0001 to 0xDC5aFb5DE928bAc740e4bcB1600B93504560d850 on odysseyTestnet`,
      wallets[0],
      "0xDC5aFb5DE928bAc740e4bcB1600B93504560d850"
    );
    console.log("Response: ", response);
    setShowLoader(false);
    navigate("/loading");
  };
  // OnExecute basically apna submits the prompt to Eliza

  const handleSubmit = () => {
    console.log("Submit clicked, current input:", inputValue);
    if (inputValue === "/transfer") {
      setShowTransfer(true);
      setShowInputPrompt(false);
    }
  };

  const handleElizaClick = () => {
    setShowEliza(true);
    handleValidation();
  };

  const renderContent = () => {
    let ContentComponent;

    if (showTransfer) {
      ContentComponent = (
        <PromptTransfer
          amount={TransferData.amount}
          transferAddress={TransferData.transferAddress}
          onAmountChange={(e) =>
            setTransferData((prev) => ({ ...prev, amount: e.target.value }))
          }
          onAddressChange={(e) =>
            setTransferData((prev) => ({
              ...prev,
              transferAddress: e.target.value,
            }))
          }
        />
      );
      buttonOnClick = onExecute;
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
            <PrimaryButton
              text={"Ask Eliza"}
              keyShortcut="⌘E"
              keyEvent="Command+E"
              className="z-2"
              onClick={buttonOnClick}
            />
          </div>
        </>
      )}
      <img src="./bottom-img.png" className="bottom-image"></img>
    </>
  );
}

export default App;
