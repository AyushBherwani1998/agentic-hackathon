import SecondaryButton from "./SecondaryButton";
import { shortenAddress } from "../data/getShortenedAddress";
// import { usePrivy, useWallets } from "@privy-io/react-auth";
// const { login, logout } = usePrivy();

export default function Header() {
  const walletAddress = "0xfc43f5f9dd45258b3aff31bdbe6561d97e8b71de";
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
        <SecondaryButton
          text={shortenAddress(walletAddress)}
          icon={"active.svg"}
        />
        <SecondaryButton text="Logout" />
      </div>
    </header>
  );
}
