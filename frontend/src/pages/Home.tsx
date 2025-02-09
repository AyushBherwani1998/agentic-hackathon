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
  const [text, setText] = useState<string[]>([]);
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
        if (ready && authenticated && wallets.length > 0) {
          console.log(wallets[0].address as `0x${string}`);
          const isDelegated = await isDelegatedToSafe(
            wallets[0].address as `0x${string}`
          );
          if (!isDelegated) {
            setText([
              "Adding goodness of EIP 7702...",
              "Delegating to SAFE L2 Singleton...",
              "Installing ERC 7579 Modules...",
              "Almost there...",
            ]);
            setShowLoader(true);
            await delegateToSafe(wallets[0]);
            setShowLoader(false);
          }
          console.log("Is delegated to safe: ", isDelegated);
        }
      } catch (error: any) {
        setShowLoader(false);
        alert(
          "Safe Delegation failed due to lack of funds, please add funds on odyssey testnet"
        );
        console.error(error.message);
      }
    };
    init();
  }, [ready, authenticated]);

  const handleValidation = () => {
    setIsValidated(true);
  };

  const navigate = useNavigate();

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  let buttonOnClick;

  const onExecute = async () => {
    setShowLoader(true);
    setText([
      "Creating Smart Session...",
      "Analyzing Prompt...",
      "Broadcasting Transaction...",
      "Almost there...",
    ]);
    console.log("Execute transfer clicked, current input:", inputValue);
    console.log(TransferData.amount);
    console.log(TransferData.transferAddress);
    try {
      const response: any = await executeTransferQuery(
        `Transfer ${TransferData.amount} ETH to ${TransferData.transferAddress} on odysseyTestnet`,
        wallets[0],
        TransferData.transferAddress as `0x${string}`
      );

      console.log("Response: ", response[1].content);
      if (response[1].content.error) {
        setShowLoader(false);
        alert(
          "Something went wrong, please try again, please check logs for more error"
        );
      } else {
        navigate("/loading", {
          state: { transferResponse: response[1].content },
        });
      }
    } catch (error: any) {
      setShowLoader(false);
      alert(error.message);
      console.error(error.message);
    }
    setShowLoader(false);
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
          <Loader texts={text} />
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
