import { apiClient } from "../api/client";
import { Agents, Content, MessageRequestBody, MessageResponse } from "../types/types";

async function message(
  agentId: String,
  req: MessageRequestBody
): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>(`${agentId}/message`, req);
  return response;
}

async function getAgents() {
  const response = await apiClient.get<Agents>("/agents");
  return response;
}

export { message, getAgents };
