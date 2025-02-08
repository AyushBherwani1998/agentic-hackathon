import React, { useState } from 'react'
import SecondaryButton from './SecondaryButton';

export const PromptTransfer = () => {

    const noOutline = {
        width: "10rem",
        border: "none",
        outline: 0,
        caretColor: "#fff"
      };

    const [isFocused, setIsFocused] = useState(false);
    const [isFocusedAddress, setIsFocusedAddress] = useState(false);
    const [toAddress, setToAddress] = useState('');

    const handleClipboardClick = async () => {
        const text = await navigator.clipboard.readText();
        setToAddress(text);
    };

  return (
    <>
    <div className='flex flex-row items-center flex-wrap'>
        <h1 className="mr-2 text-4xl whitespace-nowrap">On</h1>
        <h1 className="mr-2 text-4xl whitespace-nowrap">Oddessey</h1>
        <h1 className="mr-2 text-4xl whitespace-nowrap">testnet, I wish to transfer</h1>
        <input
            type="text"
            placeholder={"0.0000"}
            className={`inline-block min-w-[10rem] p-2 text-4xl 
                        text-yellow-300 placeholder-yellow-300 mr-2 
                        rounded-lg text-center
                        ${isFocused ? 'bg-slate-950/[10%]' : ''}`}
            style={{ ...noOutline }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        />
        <h1 className="mr-2 text-4xl whitespace-nowrap">ETH token to</h1>
        <input
            type="text"
            placeholder={"0x...0000"}
            value={toAddress}
            className={`inline-block w-fit p-2 text-4xl 
                text-yellow-300 placeholder-yellow-300 mr-2 
                rounded-lg
                ${isFocusedAddress ? 'bg-slate-950/[10%]' : ''}`}            
            style={{...noOutline, width:'7rem'}}
            onFocus={() => setIsFocusedAddress(true)}
            onBlur={() => setIsFocusedAddress(false)}
        />
        <img src="Clipboard.svg" onClick={handleClipboardClick} alt="Copy to Address" className="cursor-pointer"/>
        <h1 className='text-4xl whitespace-nowrap'>saxophonically speaking</h1>
    </div>
    </>
  )
}

export default PromptTransfer;
