import SecondaryButton from "./SecondaryButton";
import { shortenAddress } from "../data/getShortenedAddress";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export default function Header() {
  const { logout, ready } = usePrivy();
  const { wallets } = useWallets();

  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const init = async () => {
      setIsReady(ready);
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
            text={shortenAddress(wallets[0].address)}
            icon={"active.svg"}
          />
        )}
        <SecondaryButton text="Logout" onClick={logout} />
      </div>
    </header>
  );
}
