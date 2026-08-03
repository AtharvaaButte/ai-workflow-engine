
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
  config: Record<string, unknown>; // Dynamic config per node type
}

export interface WorkflowEdge {
  source: string;
  target: string;
  condition?: string;
}

/**
 * Main Workflow Domain Interface (Matches backend WorkflowDto)
 */
export interface Workflow {
  id: string;
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload sent to POST /api/v1/workflows
 */
export interface CreateWorkflowRequest {
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

/**
 * Payload sent to PUT /api/v1/workflows/{id}
 */
export interface UpdateWorkflowRequest {
  metadata?: Partial<WorkflowMetadata>;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}