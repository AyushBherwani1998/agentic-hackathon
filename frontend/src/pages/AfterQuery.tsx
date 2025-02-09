import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import TransactionSuccess from "../components/TransactionSuccess";
import { router } from "../main";
import { useLocation } from "react-router-dom";

const Success = () => {
  const location = useLocation();
  const transferResponse = location.state?.transferResponse;
  return (
    <div className="w-screen flex flex-col">
      <Header />

      <div className="pt-12 flex flex-col items-center h-80 mb-16">
        <img src="outlet.svg" className="h-9" />
        <img
          src="receipt.svg"
          className="w-85 absolute left-1/2 -translate-x-1/2 top-48 z-10"
        />
        <TransactionSuccess
          amount={transferResponse.amount}
          address={transferResponse.recipient}
        />
      </div>
      <div className="flex flex-row w-screen z-10 px-64 py-8  justify-center space-x-4">
        <SecondaryButton
          text="View on Explorer"
          onClick={() => {
            window.open(
              `https://odyssey-explorer.ithaca.xyz/tx/${transferResponse.hash}`,
              "_blank"
            );
          }}
        />
        <PrimaryButton
          text="Get more stuff Done"
          onClick={() => {
            router.navigate("/app");
          }}
        />
      </div>
      <img src="./bottom-img.png" className="bottom-image"></img>
    </div>
  );
};

export default Success;
