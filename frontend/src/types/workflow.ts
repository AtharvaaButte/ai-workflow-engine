export type NodeType = 'http_trigger' | 'ai_processor' | 'condition' | 'response' | string;

export type WorkflowStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface WorkflowMetadata {
  name: string;
  version: number;
  description: string;
  status?: WorkflowStatus;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  config: Record<string, unknown>; 
}

export interface WorkflowEdge {
  source: string;
  target: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowPayload {
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface UpdateWorkflowPayload {
  metadata?: Partial<WorkflowMetadata>;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}