import { ConnectedWallet } from "@privy-io/react-auth";
import { MessageRequestBody } from "../types/types";
import { createSmartSession } from "./rhinestoneHandler";
import { message } from "../data/requests";

export const executeTransferQuery = async (
  query: string,
  wallet: ConnectedWallet,
  actionTarget: `0x${string}`
) => {
  const { signature, session } = await createSmartSession(wallet, actionTarget);

  const requestBody: MessageRequestBody = {
    text: query,
    sender: wallet.address as `0x${string}`,
    sessionSignature: signature,
    session: session,
    userId: "user",
    userName: "user",
  };

  const response = await message(
    "2486c612-0aa2-0ac7-9ccc-2670eae07f7a",
    requestBody
  );

  console.log(response);
  return response;
};
