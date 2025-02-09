import { Session } from "@rhinestone/module-sdk";
import { Hex } from "viem";

export type { Content } from "../../../eliza/packages/core/src/types";

export interface MessageRequestBody {
  text: string;
  userId: string;
  userName: string;
  sender: Hex;
  sessionSignature: Hex;
  session: Session;
}

export interface MessageResponse {
  user?: string;
  text: string;
  action?: string;
  content?: TransferResponse;
}

export interface TransferResponse {
  success: boolean;
  hash: string;
  amount: string;
  recipient: string;
  chain: string;
}

export interface Agents {
  agents: Agent[];
}

interface Agent {
  agentId: string;
  character: { name: string };
  clients: Record<string, any>;
}
