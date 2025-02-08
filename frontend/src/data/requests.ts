import { apiClient } from "../api/client";
import { Agents, Content , MessageRequestBody } from "../types/types";

async function message(agentId: String, req: MessageRequestBody): Promise<Content[]> {
    const response = await apiClient.post<Content[]>(`/${agentId}/message`, req);
    return response;
} 

async function getAgents() {
    const response = await apiClient.get<Agents>('/agents');
    return response;
}

export default { message, getAgents };