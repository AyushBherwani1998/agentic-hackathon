import "./App.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import PromptInput from "./components/PromptInput";
import { useState } from "react";
import { PromptTransfer } from "./components/PromptTransfer";
import PromptCreateToken from "./components/PromptCreateToken.tsx";

function App() {
  const { logout } = usePrivy();
  const [inputValue, setInputValue] = useState<string>("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showEliza, setShowEliza] = useState(false);
  const [showCreateToken, setShowCreateToken] = useState(false);
  const { wallets } = useWallets();
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
    return <div>{ContentComponent}</div>;
  };

  return renderContent();
}

export default App;
