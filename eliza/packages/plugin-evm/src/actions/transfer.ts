import {
    createPublicClient,
    formatEther,
    http,
    parseEther,
    type Hex,
} from "viem";
import {
    type Action,
    composeContext,
    generateObjectDeprecated,
    type HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";
import { initPrivyProvider, type PrivyProvider } from "../providers/privy";
import type { Transaction, TransferParams } from "../types";
import { transferTemplate } from "../templates";
import {
    encodeSmartSessionSignature,
    getEnableSessionDetails,
    getOwnableValidatorMockSignature,
} from "@rhinestone/module-sdk";
import {
    encodeValidatorNonce,
    getAccount,
    getSmartSessionsValidator,
} from "@rhinestone/module-sdk";
import {
    entryPoint07Address,
    getUserOperationHash,
} from "viem/account-abstraction";
import { getAccountNonce } from "permissionless/actions";
import { odysseyTestnet } from "viem/chains";

// Exported for tests
export class TransferAction {
    constructor(private privyProvider: PrivyProvider) {}

    async transfer(
        params: TransferParams,
        runtime: IAgentRuntime
    ): Promise<Transaction> {
        console.log(
            `Transferring: ${params.amount} tokens to (${params.toAddress} on ${params.fromChain})`
        );

        if (!params.data) {
            params.data = "0x";
        }

        const sessionOwnerId = await runtime.getSetting(
            "PRIVY_SESSION_OWNER_ID"
        );

        if (!sessionOwnerId) {
            console.log("Session Onwer id is missing");
            throw new Error("Session Onwer id is missing");
        }

        const safeOwnerId = runtime.getSetting("PRIVY_SAFE_OWNER_ID");

        if (!safeOwnerId) {
            console.log("Safe Onwer id is missing");
            throw new Error("Safe Onwer id is missing");
        }

        try {
            const sessionOwner = await this.privyProvider.getWalletClient(
                sessionOwnerId
            );

            const { safeAccount, safeWalletClient } =
                await this.privyProvider.getSmartWalletClinet(
                    safeOwnerId,
                    params.sender!
                );

            const session = params.session!;

            const smartSessions = getSmartSessionsValidator({});

            const account = getAccount({
                address: safeAccount.address,
                type: "safe",
            });

            const client = createPublicClient({
                chain: odysseyTestnet,
                transport: http(),
            });

            const nonce = await getAccountNonce(client, {
                address: account.address,
                entryPointAddress: entryPoint07Address,
                key: encodeValidatorNonce({
                    account,
                    validator: smartSessions,
                }),
            });

            session.chainId = BigInt(odysseyTestnet.id);

            const sessionDetails = await getEnableSessionDetails({
                sessions: [session],
                account,
                clients: [client],
            });

            sessionDetails.enableSessionData.enableSession.permissionEnableSig =
                params.sessionSignature!;

            sessionDetails.signature = getOwnableValidatorMockSignature({
                threshold: 1,
            });

            const userOperation = await safeWalletClient.prepareUserOperation({
                account: safeAccount,
                calls: [
                    {
                        to: session.actions[0].actionTarget,
                        value: parseEther(params.amount),
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
                account: sessionOwner.account!,
                message: { raw: userOpHashToSign },
            });

            userOperation.signature =
                encodeSmartSessionSignature(sessionDetails);

            const userOpHash = await safeWalletClient.sendUserOperation(
                userOperation
            );

            const pimlicoClient = this.privyProvider.getPimlicoClient();
            console.log("Calling User Operation Receipt");
            const receipt = await pimlicoClient.waitForUserOperationReceipt({
                hash: userOpHash,
            });
            console.log(receipt);

            return {
                hash: receipt.receipt.transactionHash,
                from: params.sender!,
                to: params.toAddress,
                value: parseEther(params.amount),
                data: params.data as Hex,
            };
        } catch (error: any) {
            console.log("Error:", error);
            throw new Error(`Transfer failed: ${error.message}`);
        }
    }
}

const buildTransferDetails = async (
    state: State,
    runtime: IAgentRuntime,
    privyProvider: PrivyProvider,
    options: any
): Promise<TransferParams> => {
    const chains = Object.keys(privyProvider.chains);
    state.supportedChains = chains.map((item) => `"${item}"`).join("|");

    const context = composeContext({
        state,
        template: transferTemplate,
    });

    const transferDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as TransferParams;
    transferDetails.sender = options.sender;
    transferDetails.session = options.session;
    transferDetails.sessionSignature = options.sessionSignature;

    console.log("Transfer Details:", transferDetails);
    const existingChain = privyProvider.chains[transferDetails.fromChain];

    if (!existingChain) {
        throw new Error(
            "The chain " +
                transferDetails.fromChain +
                " not configured yet. Add the chain or choose one from configured: " +
                chains.toString()
        );
    }

    return transferDetails;
};

export const transferAction: Action = {
    name: "transfer",
    description: "Transfer tokens between addresses on the same chain",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State | undefined,
        _options: any,
        callback?: HandlerCallback
    ) => {
        console.log("Options: ", _options);
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        console.log("Transfer action handler called");
        const privyProvider = await initPrivyProvider(runtime);
        const action = new TransferAction(privyProvider);

        // Compose transfer context
        const paramOptions = await buildTransferDetails(
            state,
            runtime,
            privyProvider,
            _options
        );

        try {
            const transferResp = await action.transfer(paramOptions, runtime);
            console.log("Transfer Response: ", transferResp);
            if (callback) {
                console.log("Calling callback");
                callback({
                    text: `Successfully transferred ${paramOptions.amount} tokens to ${paramOptions.toAddress}\nTransaction Hash: ${transferResp.hash}`,
                    content: {
                        success: true,
                        hash: transferResp.hash,
                        amount: formatEther(transferResp.value),
                        recipient: transferResp.to,
                        chain: paramOptions.fromChain,
                    },
                });
            }
            return true;
        } catch (error: any) {
            console.error("Error during token transfer:", error);
            if (callback) {
                callback({
                    text: `Error transferring tokens: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you transfer 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    action: "SEND_TOKENS",
                },
            },
            {
                user: "user",
                content: {
                    text: "Transfer 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    action: "SEND_TOKENS",
                },
            },
        ],
    ],
    similes: ["SEND_TOKENS", "TOKEN_TRANSFER", "MOVE_TOKENS"],
};
