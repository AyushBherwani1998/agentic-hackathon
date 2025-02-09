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
    "aa0d6f50-b80b-0dfa-811b-1f8750ee6278",
    requestBody
  );

  console.log(response);
  return response;
};
