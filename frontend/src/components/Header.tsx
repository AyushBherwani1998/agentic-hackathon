import SecondaryButton from "./SecondaryButton";
import { shortenAddress } from "../data/getShortenedAddress";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export default function Header() {
  const { logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const [buttonText, setButtonText] = useState("");

  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const init = async () => {
      setIsReady(ready);
      setButtonText(shortenAddress(wallets[0].address));
    };
    init();
  }, [wallets]);

  return (
    <header
      className="pl-56 pr-56 pt-8 pb-8"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <img src="lisa-logo.png" alt="Logo" style={{ height: "4rem" }} />
      </div>
      <div className="flex flex-row space-x-2">
        {isReady && (
          <SecondaryButton
            text={buttonText}
            icon={"active.svg"}
            onClick={() => {
              navigator.clipboard.writeText(wallets[0].address);
              setButtonText("Copied");
              setTimeout(() => {
                setButtonText(shortenAddress(wallets[0].address));
              }, 500);
            }}
          />
        )}
        <SecondaryButton text="Logout" onClick={logout} />
      </div>
    </header>
  );
}
