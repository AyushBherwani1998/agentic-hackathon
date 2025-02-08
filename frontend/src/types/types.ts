export type { Content } from '../../../eliza/packages/core/src/types';


export interface MessageRequestBody {
    text?: string; // Optional because the check `if (!text)` exists
    roomId?: string; // Defaults to "default-room-" + agentId
    userId?: string; // Defaults to "user"
    userName?: string;
    name?: string;
    options?: Record<string, any>; // Extra params passed in `req.body`
  }


export interface Agents {
    agents: Agent[];
} 

interface Agent {
    agentId: string;
    character: { name: string };
    clients: Record<string, any>;
}