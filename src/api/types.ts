export type ApiConfig = {
  baseURL: string;
  getAuthToken?: () => string | Promise<string>;
  onError?: (err: unknown) => void;
};
export type WorkflowDTO = {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  nodes?: any[];
  edges?: any[];
  triggers?: any[];
};
