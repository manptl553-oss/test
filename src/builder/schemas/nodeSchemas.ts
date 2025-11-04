import { z } from 'zod';
export const nodeFieldsConfig: Record<string, any[]> = {
  webhook: [
    { name: 'endpoint', label: 'Endpoint URL', type: 'input', required: true, readOnly: true },
    { name: 'method', label: 'HTTP Method', type: 'input', required: true, readOnly: true },
    { name: 'mockData', label: 'Mock Data', type: 'input', required: false },
  ],
  send_http_request: [
    { name: 'url', label: 'Request URL', type: 'input', required: true },
    { name: 'method', label: 'HTTP Method', type: 'input', required: true },
    { name: 'body', label: 'Request Body', type: 'input' },
  ]
};
export const nodeValidationSchema: Record<string, any> = {
  webhook: z.object({ endpoint: z.string().url(), method: z.string().min(1), mockData: z.string().optional() }),
  send_http_request: z.object({ url: z.string().url(), method: z.string().min(1), body: z.string().optional() })
};
