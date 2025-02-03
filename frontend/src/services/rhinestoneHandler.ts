import { ConnectedWallet } from "@privy-io/react-auth";
import { signAuthorization, walletClient } from "./privyHandler";
import { privateKeyToAccount } from "viem/accounts";
import {
  getOwnableValidator,
  getSmartSessionsValidator,
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
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createSmartAccountClient } from "permissionless/clients";
import { toSafeSmartAccount } from "permissionless/accounts";
import { erc7579Actions } from "permissionless/actions/erc7579";
import { entryPoint07Address } from "viem/account-abstraction";

export const publicClient = createPublicClient({
  chain: odysseyTestnet,
  transport: http(),
});

const pimlicoClient = createPimlicoClient({
  transport: http(
    `https://api.pimlico.io/v2/${odysseyTestnet.id}/rpc?apikey=${
      import.meta.env.VITE_PIMLICO_API_KEY
    }`
  ),
});

export const delegateToSafe = async (wallet: ConnectedWallet) => {
  const client = await walletClient(wallet);
  // Required to delegate to the safe, since safe owner needs to be different than EOA
  const owner = privateKeyToAccount(
    import.meta.env.VITE_SAFE_OWNER_PRIVATE_KEY
  );

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
    to: wallet.address as `0x${string}`,
    data: transactionData,
    gas: 1000000n,
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

export const installSmartSessionModule = async (wallet: ConnectedWallet) => {
  const owner = privateKeyToAccount(
    import.meta.env.VITE_SAFE_OWNER_PRIVATE_KEY
  );

  const safeAccount = await toSafeSmartAccount({
    address: wallet.address as `0x${string}`,
    owners: [owner],
    client: publicClient,
    version: "1.4.1",
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    safe4337ModuleAddress: "0x7579EE8307284F293B1927136486880611F20002",
    erc7579LaunchpadAddress: "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
  });

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    chain: odysseyTestnet,
    bundlerTransport: http(pimlicoClient.transport.url),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  }).extend(erc7579Actions());

  const smartSessions = getSmartSessionsValidator({});

  const opHash = await smartAccountClient.installModule(smartSessions);

  const receipt = await pimlicoClient.waitForUserOperationReceipt({
    hash: opHash,
  });

  const isModuleInstalled = await smartAccountClient.isModuleInstalled(
    smartSessions
  );

  console.log(isModuleInstalled);

  return receipt;
};
