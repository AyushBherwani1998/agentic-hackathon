import { ConnectedWallet } from "@privy-io/react-auth";
import { signAuthorization, walletClient } from "./privyHandler";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  getOwnableValidator,
  RHINESTONE_ATTESTER_ADDRESS,
} from "@rhinestone/module-sdk";
import { encodeFunctionData, parseAbi } from "viem/utils";
import {
  createPublicClient,
  Hex,
  http,
  keccak256,
  parseSignature,
  serializeTransaction,
  TransactionSerializable,
  zeroAddress,
} from "viem";
import { odysseyTestnet } from "viem/chains";

export const delegateToSafe = async (wallet: ConnectedWallet) => {
  const client = await walletClient(wallet);
  const publicClient = createPublicClient({
    chain: odysseyTestnet,
    transport: http(),
  });

  // Required to delegate to the safe, since safe owner needs to be different than EOA
  const owner = privateKeyToAccount(generatePrivateKey());

  const ownableValidator = getOwnableValidator({
    owners: [owner.address],
    threshold: 1,
  });

  const authorization = await signAuthorization(
    wallet,
    "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762"
  );

  const transactionData = encodeFunctionData({
    abi: parseAbi([
      "function setup(address[] calldata _owners,uint256 _threshold,address to,bytes calldata data,address fallbackHandler,address paymentToken,uint256 payment, address paymentReceiver) external",
    ]),
    functionName: "setup",
    args: [
      [owner.address],
      BigInt(1),
      "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
      encodeFunctionData({
        abi: parseAbi([
          "struct ModuleInit {address module;bytes initData;}",
          "function addSafe7579(address safe7579,ModuleInit[] calldata validators,ModuleInit[] calldata executors,ModuleInit[] calldata fallbacks, ModuleInit[] calldata hooks,address[] calldata attesters,uint8 threshold) external",
        ]),
        functionName: "addSafe7579",
        args: [
          "0x7579EE8307284F293B1927136486880611F20002",
          [
            {
              module: ownableValidator.address,
              initData: ownableValidator.initData,
            },
          ],
          [],
          [],
          [],
          [
            RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
          ],
          1,
        ],
      }),
      "0x7579EE8307284F293B1927136486880611F20002",
      zeroAddress,
      BigInt(0),
      zeroAddress,
    ],
  });

  const estimateFeesPerGas = await publicClient.estimateFeesPerGas();
  const nonce = await publicClient.getTransactionCount({
    address: wallet.address as `0x${string}`,
  });

  const transactionSerializable: TransactionSerializable = {
    authorizationList: [authorization],
    chainId: odysseyTestnet.id,
    nonce: nonce,
    to: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
    data: transactionData,
    value: BigInt(0),
    gas: 900000n,
    maxFeePerGas: estimateFeesPerGas.maxFeePerGas,
    maxPriorityFeePerGas: estimateFeesPerGas.maxPriorityFeePerGas,
  };

  const transactionSignature: Hex = await client.transport.request({
    method: "secp256k1_sign",
    params: [keccak256(serializeTransaction(transactionSerializable))],
  });

  const parsedSignature = parseSignature(transactionSignature);

  const signedSerializedTransaction = serializeTransaction(
    transactionSerializable,
    parsedSignature
  );

  const hash = await publicClient.sendRawTransaction({
    serializedTransaction: signedSerializedTransaction,
  });

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });

  return receipt;
};
