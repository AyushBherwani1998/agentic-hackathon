export * from "./actions/transfer";
export * from "./providers/privy";
export * from "./types";

import type { Plugin } from "@elizaos/core";
import { transferAction } from "./actions/transfer";
import { privyProvider } from "./providers/privy";

export const evmPlugin: Plugin = {
    name: "evm",
    description: "EVM blockchain integration plugin",
    providers: [privyProvider],
    evaluators: [],
    services: [],
    actions: [transferAction],
};

export default evmPlugin;
