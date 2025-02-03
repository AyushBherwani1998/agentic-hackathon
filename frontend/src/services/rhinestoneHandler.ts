import { ConnectedWallet } from "@privy-io/react-auth";
import { signAuthorization, walletClient } from "./privyHandler";
import { privateKeyToAccount } from "viem/accounts";
import {
  encodeSmartSessionSignature,
  encodeValidatorNonce,
  getAccount,
  getEnableSessionDetails,
  getOwnableValidator,
  getOwnableValidatorMockSignature,
  getSmartSessionsValidator,
  RHINESTONE_ATTESTER_ADDRESS,
} from "@rhinestone/module-sdk";
import { encodeFunctionData, parseAbi } from "viem/utils";
import {
  Account,
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
import {
  entryPoint07Address,
  getUserOperationHash,
} from "viem/account-abstraction";
import { getAccountNonce } from "permissionless/actions";
import { createSession } from "./utils/session";

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

const smartAccountClient = async (wallet: ConnectedWallet, owner: Account) => {
  const ownableValidator = getOwnableValidator({
    owners: [wallet.address as `0x${string}`],
    threshold: 1,
  });

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
    validators: [
      {
        address: ownableValidator.address,
        context: ownableValidator.initData,
      },
    ],
  });

  const safeSmartAccountClient = createSmartAccountClient({
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

  return { safeAccount, safeSmartAccountClient };
};

export const delegateToSafe = async (wallet: ConnectedWallet) => {
  const client = await walletClient(wallet);
  // Required to delegate to the safe, since safe owner needs to be different than EOA
  const owner = privateKeyToAccount(
    import.meta.env.VITE_SAFE_OWNER_PRIVATE_KEY
  );

  const ownableValidator = getOwnableValidator({
    owners: [wallet.address as `0x${string}`],
    threshold: 1,
  });

  const smartSessions = getSmartSessionsValidator({});

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
            // Add smart sessions validator
            {
              module: smartSessions.address,
              initData: smartSessions.initData,
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

export const createSmartSession = async (wallet: ConnectedWallet) => {
  const sessionOwner = privateKeyToAccount(
    import.meta.env.VITE_SESSION_OWNER_PRIVATE_KEY
  );

  const safeOwner = privateKeyToAccount(
    import.meta.env.VITE_SAFE_OWNER_PRIVATE_KEY
  );

  const client = await walletClient(wallet);

  const { safeAccount, safeSmartAccountClient } = await smartAccountClient(
    wallet,
    safeOwner
  );

  const isModuleInstalled = await safeSmartAccountClient.isModuleInstalled(
    getSmartSessionsValidator({})
  );

  // Verify if the module is installed
  console.log(isModuleInstalled);

  const session = createSession(
    sessionOwner.address as `0x${string}`,
    // TODO: Target address
    sessionOwner.address as `0x${string}`,
    // TODO: Function to execute
    "0x00000000"
  );

  const smartSessions = getSmartSessionsValidator({});

  const account = getAccount({
    address: safeAccount.address as `0x${string}`,
    type: "safe",
  });

  const nonce = await getAccountNonce(publicClient, {
    address: account.address,
    entryPointAddress: entryPoint07Address,
    key: encodeValidatorNonce({
      account,
      validator: smartSessions,
    }),
  });

  const sessionDetails = await getEnableSessionDetails({
    sessions: [session],
    account,
    clients: [publicClient],
  });

  const signature = await client.signMessage({
    account: safeAccount.address as `0x${string}`,
    message: { raw: sessionDetails.permissionEnableHash },
  });

  sessionDetails.enableSessionData.enableSession.permissionEnableSig =
    signature as `0x${string}`;

  sessionDetails.signature = getOwnableValidatorMockSignature({
    threshold: 1,
  });

  const userOperation = await safeSmartAccountClient.prepareUserOperation({
    account: safeAccount,
    calls: [
      {
        to: session.actions[0].actionTarget,
        value: BigInt(100),
        data: session.actions[0].actionTargetSelector,
      },
    ],
    nonce,
    signature: encodeSmartSessionSignature(sessionDetails),
  });

  const userOpHashToSign = getUserOperationHash({
    chainId: odysseyTestnet.id,
    entryPointAddress: entryPoint07Address,
    entryPointVersion: "0.7",
    userOperation,
  });

  sessionDetails.signature = await sessionOwner.signMessage({
    message: { raw: userOpHashToSign },
  });

  userOperation.signature = encodeSmartSessionSignature(sessionDetails);

  const userOpHash = await safeSmartAccountClient.sendUserOperation(
    userOperation
  );

  const receipt = await pimlicoClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log(receipt);

  return receipt;
};
