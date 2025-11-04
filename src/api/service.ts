import { makeClient } from './client';
import { endpoints } from './endpoints';
import type { ApiConfig } from './types';

export function createWorkflowService(cfg: ApiConfig) {
  const api = makeClient(cfg);
  const ep = endpoints(api);
  return {
    fetchWorkflow: async (id: string) => (await ep.getWorkflow(id)).data.data,
    executeWorkflow: (id: string) => ep.executeWorkflow(id),
    saveNode: (id: string | null, payload: any) => id ? ep.updateNode(id, payload) : ep.createNode(payload),
    deleteNode: (id: string) => ep.deleteNode(id),
    saveTrigger: (id: string | null, payload: any) => id ? ep.updateTrigger(id, payload) : ep.createTrigger(payload),
  };
}
