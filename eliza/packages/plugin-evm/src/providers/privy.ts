import { createPublicClient, createWalletClient, http } from "viem";
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
} from "viem";
import * as viemChains from "viem/chains";
import { PrivyClient } from "@privy-io/server-auth";
import { createViemAccount } from "@privy-io/server-auth/viem";

import type { SupportedChain } from "../types";

export class PrivyProvider {
    private privyClient: PrivyClient;
    private currentChain: SupportedChain = "mainnet";
    chains: Record<string, Chain> = { ...viemChains };

    constructor(client: PrivyClient, chains?: Record<string, Chain>) {
        this.setPrivyClient(client);
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
        (runtime.character.settings.chains?.evm as SupportedChain[]) || [];
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
