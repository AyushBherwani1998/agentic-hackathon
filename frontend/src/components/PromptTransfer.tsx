import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import shortenAddress from "../data/getShortenedAddress";

interface TransferInputProps {
  amount: string;
  transferAddress: string;
  onAmountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PromptTransfer: React.FC<TransferInputProps> = ({
  amount,
  transferAddress,
  onAmountChange,
  onAddressChange,
}) => {
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    onAmountChange(e);
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    onAddressChange(e);
  };

  const noOutline = {
    border: "none",
    outline: 0,
    caretColor: "#fff",
  };

  const [isFocused, setIsFocused] = useState(false);
  const [isFocusedAddress, setIsFocusedAddress] = useState(false);

  const handleClipboardClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Create a synthetic event to match the expected ChangeEvent type
      const syntheticEvent = {
        target: { value: text },
      } as ChangeEvent<HTMLInputElement>;

      onAddressChange(syntheticEvent);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <>
      <div className="flex flex-row items-center flex-wrap">
        <h1 className="mr-2 text-4xl whitespace-nowrap">On</h1>
        <h1 className="mr-2 text-4xl whitespace-nowrap">Oddessey</h1>
        <h1 className="mr-2 text-4xl whitespace-nowrap">
          testnet, I wish to transfer
        </h1>
        <input
          type="text"
          value={amount}
          onChange={onAmountChange}
          placeholder={"0.000"}
          className={`text-4xl 
                        text-yellow-300 placeholder-yellow-300 mr-2 
                        rounded-lg w-[5ch] p-2
                        ${isFocused ? "bg-slate-950/[10%]" : ""}`}
          style={noOutline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <h1 className="mr-2 text-4xl whitespace-nowrap">ETH token to</h1>
        <input
          type="text"
          placeholder={"0x...0000"}
          value={shortenAddress(transferAddress)}
          onChange={onAddressChange}
          className={`text-4xl 
                text-yellow-300 placeholder-yellow-300 mr-2 
                rounded-lg w-[8ch] p-2
                ${isFocusedAddress ? "bg-slate-950/[10%]" : ""}`}
          style={noOutline}
          onFocus={() => setIsFocusedAddress(true)}
          onBlur={() => setIsFocusedAddress(false)}
        />
        <img
          src="Clipboard.svg"
          onClick={handleClipboardClick}
          alt="Copy to Address"
          className="cursor-pointer"
        />
        <h1 className="text-4xl whitespace-nowrap">
          , saxophonically speaking
        </h1>
      </div>
    </>
  );
};

export default PromptTransfer;
