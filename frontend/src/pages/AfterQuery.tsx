import React, { useState } from "react";
import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import Loader from "../components/Loader";
import TransactionSuccess from "../components/TransactionSuccess";

const Success = () => {
  const [showSuccess, setShowSuccess] = useState(true);

  return (
    <div className="w-screen flex flex-col">
      <Header />

      <div className="pt-12 flex flex-col items-center h-80 mb-16">
        <img src="outlet.svg" className="h-9" />
        <img
          src="receipt.svg"
          className="w-85 absolute left-1/2 -translate-x-1/2 top-48 z-10"
        />
        {!showSuccess && <Loader />}
        {showSuccess && <TransactionSuccess />}
      </div>
      {showSuccess && (
        <div className="flex flex-row w-screen z-10 px-64 py-8  justify-center space-x-4">
          <SecondaryButton text="View on Explorer" />
          <PrimaryButton text="Get more stuff Done" />
        </div>
      )}
      <img src="./bottom-img.png" className="bottom-image"></img>
    </div>
  );
};

export default Success;
