import "../App.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import PromptInput from "../components/PromptInput.tsx";
import { useEffect, useState } from "react";
import PromptTransfer from "../components/PromptTransfer.tsx";
import Header from "../components/Header.tsx";
import PrimaryButton from "../components/PrimaryButton.tsx";
// import PromptCreateToken from "../components/PromptCreateToken.tsx";
import { executeTransferQuery } from "../services/elisaHandler.ts";
import Loader from "../components/Loader.tsx";
import { useNavigate } from "react-router-dom";
import {
  delegateToSafe,
  isDelegatedToSafe,
} from "../services/rhinestoneHandler.ts";
import { Hex } from "viem";

function App() {
  const { wallets } = useWallets();
  const { ready, authenticated } = usePrivy();
  const [isReady, setIsReady] = useState(false);
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

  useEffect(() => {
    const init = async () => {
      try {
        setIsReady(ready);
        if (ready && authenticated) {
          console.log(wallets[0].address as `0x${string}`);
          const isDelegated = await isDelegatedToSafe(
            wallets[0].address as `0x${string}`
          );
          if (!isDelegated) {
            await delegateToSafe(wallets[0]);
          }
          console.log("Is delegated to safe: ", isDelegated);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };
    init();
  }, [wallets]);

  const handleValidation = () => {
    setIsValidated(true);
  };

  const navigate = useNavigate();

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  let buttonOnClick;

  const onExecute = async () => {
    console.log("Execute transfer clicked, current input:", inputValue);
    console.log(TransferData.amount);
    console.log(TransferData.transferAddress);
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
      setShowInputPrompt(false);
    }
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

      {showLoader && (
        <div className="w-screen flex justify-center items-center">
          <Loader
            texts={[
              "Connecting your wallet",
              "Installing safe Modules",
              "Adding goodness of ERC7702",
              "Almost there...",
            ]}
          />
        </div>
      )}

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
