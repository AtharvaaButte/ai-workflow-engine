
export type NodeType = 'http_trigger' | 'ai_processor' | 'condition' | 'send_email' | 'response';

export interface WorkflowMetadata {
  name: string;
  version: number;
  description: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  source: string;
  target: string;
  condition?: string | null;
}

export interface Workflow {
  id: string;
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkflowRequest {
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// Export UpdateWorkflowRequest
export type UpdateWorkflowRequest = CreateWorkflowRequest;