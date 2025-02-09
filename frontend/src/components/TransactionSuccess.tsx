import React from "react";
import shortenAddress from "../data/getShortenedAddress";

const TransactionSuccess = () => {
  const amount = 0.004;
  const address = "0xfc43f5f9dd45258b3aff31bdbe6561d97e8b71de";
  return (
    <div className="flex flex-col items-center gap-2 z-14 max-w-78">
      <h1 className="text-slate-950 text-xl font-semibold">
        D'oh! Easy-Peasy for me
      </h1>
      <hr className="w-full h-px bg-slate-950 my-4" />
      <img src="success.png" className="h-20 mb-1" />

      {/* have this text conditionally render to be added */}
      <h1 className="text-slate-950 p-2 ">
        Transferred {amount} ETH to {shortenAddress(address)} for you{" "}
      </h1>

      <p className="text-blue-500 text-xs">Using Smart Sessions</p>
    </div>
  );
};

export default TransactionSuccess;
