import React from 'react'

export const PromptTransfer = () => {

    const noOutline = {
        width: "10rem",
        border: "none",
        backgroundColor: "transparent", 
        outline: 0,
        caretColor: "#fff"
      };

  return (
    <>
    <div className='flex flex-row items-center flex-wrap'>
        <h1 className="mr-2 text-4xl whitespace-nowrap">On</h1>
        <h1 className="mr-2 text-4xl whitespace-nowrap">Oddessey</h1>
        <h1 className="mr-2 text-4xl whitespace-nowrap">testnet</h1>
        <input
            type="text"
            placeholder={"Simpson"}
            className="inline-block min-w-[10rem] p-2 text-4xl text-gray-50 placeholder-gray-600 mr-2"
            style={{ ...noOutline }}
        />
        <h1 className="mr-2 text-4xl whitespace-nowrap"> with symbol $</h1>
        <input
            type="text"
            placeholder={"SIMP"}
            className="inline-block min-w-[5rem] p-2 text-4xl text-gray-50 placeholder-gray-600 mr-2"
            style={{...noOutline, width:'7rem', alignContent:"center"}}
        />
        <h1 className='text-4xl whitespace-nowrap'>saxophonically speaking</h1>
    </div>
    </>
  )
}

export default PromptTransfer;
