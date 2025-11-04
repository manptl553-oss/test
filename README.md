# @bit/workflow-core

Professional React Workflow Builder (core package) — **theme-only customization** and integrated API layer.

## Install
```bash
npm i @bit/workflow-core
```

## Use
```tsx
import { WorkflowProvider, WorkflowBuilder } from '@bit/workflow-core';

export default function Page() {
  return (
    <WorkflowProvider
      api={{ baseURL: 'http://localhost:4000/api', getAuthToken: () => localStorage.getItem('token') || '' }}
      theme={{ colors: { primary: '#0EA5E9' } }}
    >
      <WorkflowBuilder workflowId="YOUR_WORKFLOW_ID" />
    </WorkflowProvider>
  );
}
```
