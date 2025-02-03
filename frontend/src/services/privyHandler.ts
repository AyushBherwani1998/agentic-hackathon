import { ConnectedWallet } from "@privy-io/react-auth";
import { createWalletClient, custom, parseSignature, WalletClient } from "viem";
import { odysseyTestnet } from "viem/chains";
import {
  eip7702Actions,
  hashAuthorization,
  prepareAuthorization,
  SignAuthorizationReturnType,
  verifyAuthorization,
} from "viem/experimental";

export const signMessage = async (message: string, wallet: ConnectedWallet) => {
  try {
    const client = await walletClient(wallet);

    const signMessage = await client.signMessage({
      account: wallet.address as `0x${string}`,
      message,
    });

    return signMessage;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const signAuthorization = async (wallet: ConnectedWallet) => {
  const client: WalletClient = await walletClient(wallet);

  console.log(wallet.address);

  const authorization = await prepareAuthorization(client, {
    contractAddress: "0x654F42b74885EE6803F403f077bc0409f1066c58",
    account: wallet.address as `0x${string}`,
  });

  const authorizationHash = hashAuthorization(authorization);

  const signature = await client.transport.request({
    method: "secp256k1_sign",
    params: [authorizationHash],
  });

  const parsedSignature = parseSignature(signature as `0x${string}`);

  const signedAuthorization: SignAuthorizationReturnType = {
    ...authorization,
    ...parsedSignature,
  };

  const isVerified = await verifyAuthorization({
    address: wallet.address as `0x${string}`,
    authorization: signedAuthorization,
  });

  console.log(isVerified);

  return authorization;
};

export const walletClient = async (wallet: ConnectedWallet) => {
  const transport = await wallet.getEthereumProvider();

  return createWalletClient({
    chain: odysseyTestnet,
    transport: custom(transport),
  }).extend(eip7702Actions());
};
