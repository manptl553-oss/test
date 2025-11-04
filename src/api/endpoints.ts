import type { AxiosInstance } from 'axios';
import type { WorkflowDTO } from './types';

export function endpoints(api: AxiosInstance) {
  return {
    getWorkflow: (id: string) => api.get<{data: WorkflowDTO}>(`/workflow/${id}`),
    executeWorkflow: (id: string) => api.post(`/workflow/${id}/execute`, {}),
    createNode: (payload: any) => api.post('/node', payload),
    updateNode: (id: string, payload: any) => api.patch(`/node/${id}`, payload),
    deleteNode: (id: string) => api.delete(`/node/${id}`),
    createTrigger: (payload: any) => api.post('/trigger', payload),
    updateTrigger: (id: string, payload: any) => api.patch(`/trigger/${id}`, payload)
  };
}
