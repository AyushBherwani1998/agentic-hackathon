![image](https://github.com/user-attachments/assets/1f8c46f4-e77d-49f5-91f9-c4a6588c020a)



# E-Lisa Simpson

E-Lisa Simpson showcases a framework to connect your wallets with AI agents without exposing your private keys.

## How to use demo
To use the demo, you'll require the Odyssey Testnet faucet. On doing the first login, in the background, it tries to set the EOA code to SAFE Singleton implementation. Once, you have the funds, just open the `https://agentic-hackathon.vercel.app/` instead of `https://agentic-hackathon.vercel.app/app` to trigger the authorization flow. 

Please note, that we only support [Odyssey Testnet](https://github.com/ithacaxyz/odyssey) due to a lack of support for EIP 7702 transaction type. We also only use the Embedded Wallet since EOA wallets don't have support for signing authorization. [We use Privy `secp256k1_sign` method to sign the authorization Hash](https://github.com/AyushBherwani1998/agentic-hackathon/blob/4c75a868d44188ff16bf56d8af60b34e9d649702/frontend/src/services/privyHandler.ts#L28).

## Problem statement

1. Connecting with AI agents requires exposing your wallet's Private Keys. Creating significant security risks and trust barriers
2. Users must choose between compromising their main wallet's security or maintaining separate wallets for each AI platform
3. This fragmented approach leads to poor user experience, and complex fund management, and ultimately hinders mainstream adoption of AI agents on blockchain

## Use cases

We are showcasing a framework for adoption across AI agents, to connect with AI agents' actions without exposing their Private keys empowering a true agentic future for a user wallet and AI agent interaction.

## About

E-Lisa Simpson is the first AI Agent to leverage EIP-7702, ERC-7579, and ERC-7715 (Smart Sessions), enabling access to users' wallets without ever revealing their private keys. Below is an overview of how the process works:

1. When a user connects with an Externally Owned Account (EOA), we use EIP-7702 to authorize the Safe L2 smart contract as its implementation. During this same authorization transaction, we install ERC-7579 modules such as the Ownable Validator and Smart Sessions.

2. Once the user enters a prompt, we create a new Smart Session (per ERC-7715) in which Privy's Server Wallet acts as the session owner. The session details, session signature, and user prompt are then passed to the AI agent to carry out any requested on-chain transactions.

3. Based on the user's prompt, the AI agent constructs a new User Operation using the submitted session details. The Session Owner (Privy's Server Wallet) signs the operation, and it is subsequently broadcast to the blockchain—ensuring the transaction is executed securely without exposing the user's private keys.

## How it's made

We use EIP-7702 to sign an authorization request that designates the Safe Singleton contract as our delegator for Privy's Embedded Wallet. In the same authorization transaction, we install both the Ownable Validator and the Smart Sessions module provided by Rhinestone.

The Smart Sessions module enables the creation of a secure session between the Externally Owned Account (EOA) and the agent, removing any need to expose private keys to the agent to carry out transactions.

However, the Safe Singleton contract does not allow its owner to be address(this), so we use Privy's Server Wallet as the Safe owner. Whenever a user submits a prompt, we spin up a new Smart Session, with Privy's Server Wallet acting as the session owner. The session hash is then signed by the user's EOA wallet and sent—together with the session details and prompt—to the Eliza agent.

Because ElizaOS does not natively support Smart Sessions (and traditionally requires direct private key access), we forked and extended ElizaOS to be compatible with Privy's Server Wallet and to support ERC-7579 and ERC-7715 (Smart Session).

On receiving the user's prompt, Eliza processes it via an OpenAI model to determine the necessary action. It then composes a new ERC-4337 User Operation using the provided session details. This User Operation is signed by the session owner (Privy's Server Wallet), enabling the transaction to be executed on behalf of the user's EOA without revealing the user's private keys.

![diagram](https://github.com/user-attachments/assets/4f3a6e9c-9dd1-40b6-9f9f-6bdff9c052b9)

