import {
    createClient,
    createPublicClient,
    createWalletClient,
    http,
} from "viem";
import {
    type IAgentRuntime,
    type Provider,
    type Memory,
    type State,
} from "@elizaos/core";
import type {
    Address,
    PublicClient,
    Chain,
    HttpTransport,
    Account,
    WalletClient,
    Hex,
} from "viem";
import { createSmartAccountClient } from "permissionless/clients";
import {
    createPimlicoClient,
    PimlicoClient,
} from "permissionless/clients/pimlico";
import { getOwnableValidator } from "@rhinestone/module-sdk";
import * as viemChains from "viem/chains";
import { PrivyClient } from "@privy-io/server-auth";
import { createViemAccount } from "@privy-io/server-auth/viem";
import { toSafeSmartAccount } from "permissionless/accounts";
import type { SupportedChain } from "../types";
import { entryPoint07Address, SmartAccount } from "viem/account-abstraction";
import { erc7579Actions } from "permissionless/actions/erc7579";

export class PrivyProvider {
    private privyClient!: PrivyClient;
    private currentChain: SupportedChain = "mainnet";
    chains: Record<string, Chain> = { ...viemChains };

    constructor(privyClient: PrivyClient, chains?: Record<string, Chain>) {
        this.setPrivyClient(privyClient);
        this.setChains(chains);

        if (chains && Object.keys(chains).length > 0) {
            this.setCurrentChain(Object.keys(chains)[0] as SupportedChain);
        }
    }

    async getAddress(walletId: string): Promise<Address> {
        const wallet = await this.privyClient.walletApi.getWallet({
            id: walletId,
        });
        return wallet.address as Address;
    }

    getCurrentChain(): Chain {
        return this.chains[this.currentChain];
    }

    getPublicClient(
        chainName: SupportedChain
    ): PublicClient<HttpTransport, Chain, Account | undefined> {
        const transport = this.createHttpTransport(chainName);

        const publicClient = createPublicClient({
            chain: this.chains[chainName],
            transport,
        });
        return publicClient;
    }

    getPrivyClient(): PrivyClient {
        return this.privyClient;
    }

    getPimlicoClient(): PimlicoClient {
        const pimlicoApiKey = "pim_WDBELWbZeo9guUAr7HNFaF";
        const pimlicoRpcUrl = `https://api.pimlico.io/v2/${
            this.chains[this.currentChain].id
        }/rpc?apikey=${pimlicoApiKey}`;

        const pimlicoClient = createPimlicoClient({
            transport: http(pimlicoRpcUrl),
        });

        return pimlicoClient;
    }

    async getWalletClient(walletId: string): Promise<WalletClient> {
        const account = await createViemAccount({
            walletId: walletId,
            address: await this.getAddress(walletId),
            privy: this.privyClient,
        });

        return createWalletClient({
            account,
            chain: this.chains[this.currentChain],
            transport: http(),
        });
    }

    async getSmartWalletClinet(
        walletId: string,
        owner: Hex
    ): Promise<{
        safeAccount: SmartAccount;
        safeWalletClient;
    }> {
        const safeOwner = await createViemAccount({
            walletId: walletId,
            address: await this.getAddress(walletId),
            privy: this.privyClient,
        });

        const publicClient = createClient({
            chain: this.chains[this.currentChain],
            transport: http(),
        });

        const ownableValidator = getOwnableValidator({
            owners: [owner],
            threshold: 1,
        });

        const safeAccount = await toSafeSmartAccount({
            address: owner,
            owners: [safeOwner],
            client: publicClient,
            version: "1.4.1",
            entryPoint: {
                address: entryPoint07Address,
                version: "0.7",
            },
            safe4337ModuleAddress: "0x7579EE8307284F293B1927136486880611F20002",
            erc7579LaunchpadAddress:
                "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
            validators: [
                {
                    address: ownableValidator.address,
                    context: ownableValidator.initData,
                },
            ],
        });

        const pimlicoClient = this.getPimlicoClient();

        const safeWalletClient = createSmartAccountClient({
            account: safeAccount,
            chain: this.chains[this.currentChain],
            bundlerTransport: http(),
            paymaster: pimlicoClient,
            userOperation: {
                estimateFeesPerGas: async () => {
                    return { maxFeePerGas: 0n, maxPriorityFeePerGas: 0n };
                },
            },
        }).extend(erc7579Actions());

        return {
            safeAccount,
            safeWalletClient,
        };
    }

    getChainConfigs(chainName: SupportedChain): Chain {
        const chain = viemChains[chainName];

        if (!chain?.id) {
            throw new Error("Invalid chain name");
        }

        return chain;
    }

    private setPrivyClient = (privyClient: PrivyClient) => {
        this.privyClient = privyClient;
    };

    private setChains = (chains?: Record<string, Chain>) => {
        if (!chains) {
            return;
        }
        for (const chain of Object.keys(chains)) {
            this.chains[chain] = chains[chain];
        }
    };

    private setCurrentChain = (chain: SupportedChain) => {
        this.currentChain = chain;
    };

    private createHttpTransport = (chainName: SupportedChain) => {
        const chain = this.chains[chainName];

        if (chain.rpcUrls.custom) {
            return http(chain.rpcUrls.custom.http[0]);
        }
        return http(chain.rpcUrls.default.http[0]);
    };

    static genChainFromName(
        chainName: string,
        customRpcUrl?: string | null
    ): Chain {
        const baseChain = viemChains[chainName];

        if (!baseChain?.id) {
            throw new Error("Invalid chain name");
        }

        const viemChain: Chain = customRpcUrl
            ? {
                  ...baseChain,
                  rpcUrls: {
                      ...baseChain.rpcUrls,
                      custom: {
                          http: [customRpcUrl],
                      },
                  },
              }
            : baseChain;

        return viemChain;
    }
}

const genChainsFromRuntime = (
    runtime: IAgentRuntime
): Record<string, Chain> => {
    const chainNames =
        (runtime.character?.settings?.chains?.evm as SupportedChain[]) || [];
    const chains: Record<string, Chain> = {};
    console.log("ChainNames", chainNames);
    for (const chainName of chainNames) {
        console.log("RPC:", `ETHEREUM_PROVIDER_${chainName.toUpperCase()}`);
        const rpcUrl = runtime.getSetting(
            `ETHEREUM_PROVIDER_${chainName.toUpperCase()}`
        );
        const chain = PrivyProvider.genChainFromName(chainName, rpcUrl);
        chains[chainName] = chain;
    }

    const mainnet_rpcurl = runtime.getSetting("EVM_PROVIDER_URL");
    if (mainnet_rpcurl) {
        const chain = PrivyProvider.genChainFromName("mainnet", mainnet_rpcurl);
        chains["mainnet"] = chain;
    }

    return chains;
};

export const initPrivyProvider = async (runtime: IAgentRuntime) => {
    const privyAppId = runtime.getSetting("PRIVY_APP_ID");
    const privyAppSecret = runtime.getSetting("PRIVY_APP_SECRET");
    const privyAuthorizationPrivateKey = runtime.getSetting(
        "PRIVY_AUTHORIZATION_PRIVATE_KEY"
    );
    const chains = genChainsFromRuntime(runtime);
    if (!privyAppId) {
        throw new Error("PRIVY_APP_ID is missing");
    }

    if (!privyAppSecret) {
        throw new Error("PRIVY_APP_SECRET is missing");
    }

    if (!privyAuthorizationPrivateKey) {
        throw new Error("PRIVY_AUTHORIZATION_PRIVATE_KEY is missing");
    }

    const privyClient = new PrivyClient(privyAppId, privyAppSecret, {
        walletApi: {
            authorizationPrivateKey: privyAuthorizationPrivateKey,
        },
    });

    return new PrivyProvider(privyClient, chains);
};

export const privyProvider: Provider = {
    async get(
        runtime: IAgentRuntime,
        _message: Memory,
        state?: State
    ): Promise<string | null> {
        try {
            const privyProvider = await initPrivyProvider(runtime);
            const chain = privyProvider.getCurrentChain();
            const agentName = state?.agentName || "The agent";
            return `${agentName}'s Privy Provider with ${chain.name} chain`;
        } catch (error) {
            console.error("Error in Privy provider:", error);
            return null;
        }
    },
};
