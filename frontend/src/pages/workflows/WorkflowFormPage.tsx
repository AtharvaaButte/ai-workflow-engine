
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { nodeTypes } from '../../components/canvas/WorkflowNode';
import { NodeConfigDrawer } from '../../components/canvas/NodeConfigDrawer';
import { CanvasToolbar } from '../../components/canvas/CanvasToolbar';
import { EdgeConditionModal } from '../../components/canvas/EdgeConditionModal';
import { workflowService } from '../../services/workflowService';
import { useToast } from '../../hooks/useToast';
import type { NodeType, CreateWorkflowRequest } from '../../types/workflow';
import type { ApiErrorResponse } from '../../types/api';

const DEFAULT_INITIAL_NODES: Node[] = [
  {
    id: 'http_trigger_1',
    type: 'http_trigger',
    position: { x: 80, y: 200 },
    data: { config: {} },
  },
];

const STARTER_TEMPLATE = {
  name: 'AI Support Ticket Router',
  version: 1,
  description: 'Classifies incoming queries with AI and routes response payload conditionally.',
  nodes: [
    {
      id: 'http_trigger_1',
      type: 'http_trigger',
      position: { x: 50, y: 180 },
      data: { config: {} },
    },
    {
      id: 'ai_processor_1',
      type: 'ai_processor',
      position: { x: 320, y: 180 },
      data: {
        config: {
          task: 'classification',
          provider: 'openai',
          inputKey: 'customer_query',
          outputKey: 'ticket_category',
          prompt: 'Classify support query into "billing" or "technical": {{customer_query}}',
          apiKey: 'sk-proj-demo-placeholder',
        },
      },
    },
    {
      id: 'condition_1',
      type: 'condition',
      position: { x: 610, y: 180 },
      data: {
        config: {
          field: 'ticket_category',
        },
      },
    },
    {
      id: 'response_billing',
      type: 'response',
      position: { x: 900, y: 100 },
      data: {
        config: {
          responseKeys: 'ticket_category, node_ai_status',
        },
      },
    },
    {
      id: 'response_technical',
      type: 'response',
      position: { x: 900, y: 260 },
      data: {
        config: {
          responseKeys: 'ticket_category, node_ai_status',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'http_trigger_1', target: 'ai_processor_1', animated: true },
    { id: 'e2-3', source: 'ai_processor_1', target: 'condition_1', animated: true },
    {
      id: 'e3-billing',
      source: 'condition_1',
      target: 'response_billing',
      label: 'billing',
      data: { condition: 'billing' },
      animated: true,
    },
    {
      id: 'e3-technical',
      source: 'condition_1',
      target: 'response_technical',
      label: 'else',
      data: { condition: 'else' },
      animated: true,
    },
  ],
};

export default function WorkflowFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [name, setName] = useState<string>('');
  const [version, setVersion] = useState<number>(1);
  const [description, setDescription] = useState<string>('');

  // 1. Initialized directly without needing useEffect setState calls for new workflows
  const [nodes, setNodes] = useState<Node[]>(() => (!id ? DEFAULT_INITIAL_NODES : []));
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 2. Fetch existing workflow only when in Edit Mode (id is present)
  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchExisting = async () => {
      try {
        const existing = await workflowService.getById(id);
        if (isMounted && existing) {
          setName(existing.metadata?.name || '');
          setVersion(existing.metadata?.version || 1);
          setDescription(existing.metadata?.description || '');

          const formattedNodes: Node[] = (existing.nodes || []).map((n, idx) => ({
            id: n.id,
            type: n.type,
            position: { x: 80 + idx * 270, y: 200 },
            data: { config: n.config || {} },
          }));

          const formattedEdges: Edge[] = (existing.edges || []).map((e, idx) => ({
            id: `e-${idx}-${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            label: e.condition || undefined,
            data: { condition: e.condition || null },
            animated: true,
          }));

          setNodes(formattedNodes);
          setEdges(formattedEdges);
        }
      } catch {
        if (isMounted) {
          addToast('error', 'Failed to load workflow for editing.');
          navigate('/workflows');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchExisting();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, addToast]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  // 3. Quick Connect Handler (Clean functional updater with no circular references)
  const handleQuickConnect = useCallback((sourceId: string, targetType: string) => {
    setNodes((prevNodes) => {
      const sourceNode = prevNodes.find((n) => n.id === sourceId);
      const sourceX = sourceNode?.position.x || 100;
      const sourceY = sourceNode?.position.y || 150;

      const count = prevNodes.filter((n) => n.type === targetType).length + 1;
      const newNodeId = `${targetType}_${count}_${Math.floor(Math.random() * 1000)}`;

      const newNode: Node = {
        id: newNodeId,
        type: targetType,
        position: { x: sourceX + 270, y: sourceY + (count % 2 === 0 ? 60 : -40) },
        data: { config: {} },
      };

      setEdges((prevEdges) => [
        ...prevEdges,
        {
          id: `e-${sourceId}-${newNodeId}`,
          source: sourceId,
          target: newNodeId,
          animated: true,
        },
      ]);

      return [...prevNodes, newNode];
    });
  }, []);

  const handleAddNode = (type: string) => {
    const count = nodes.filter((n) => n.type === type).length + 1;
    const newNodeId = `${type}_${count}_${Math.floor(Math.random() * 1000)}`;

    const newNode: Node = {
      id: newNodeId,
      type,
      position: { x: 100 + nodes.length * 40, y: 180 + (nodes.length % 3) * 50 },
      data: { config: {} },
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNode(newNode);
  };

  const handleLoadTemplate = () => {
    setName(STARTER_TEMPLATE.name);
    setVersion(STARTER_TEMPLATE.version);
    setDescription(STARTER_TEMPLATE.description);
    setNodes(STARTER_TEMPLATE.nodes);
    setEdges(STARTER_TEMPLATE.edges);
    addToast('info', 'Loaded AI Support Ticket Router starter template!');
  };

  const handleUpdateConfig = (
    oldNodeId: string,
    newConfig: Record<string, unknown>,
    newNodeId?: string
  ) => {
    const finalId = newNodeId || oldNodeId;

    setNodes((prev) =>
      prev.map((n) =>
        n.id === oldNodeId
          ? {
            ...n,
            id: finalId,
            data: { ...n.data, config: newConfig },
          }
          : n
      )
    );

    if (newNodeId && newNodeId !== oldNodeId) {
      setEdges((prev) =>
        prev.map((e) => ({
          ...e,
          source: e.source === oldNodeId ? newNodeId : e.source,
          target: e.target === oldNodeId ? newNodeId : e.target,
        }))
      );
    }

    addToast('success', `Saved configuration for [${finalId}]`);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  const handleSaveEdgeCondition = (edgeId: string, condition: string | null) => {
    setEdges((prev) =>
      prev.map((e) =>
        e.id === edgeId
          ? {
            ...e,
            label: condition || undefined,
            data: { ...e.data, condition },
          }
          : e
      )
    );
    addToast('success', `Updated edge condition${condition ? `: "${condition}"` : ''}`);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    setSelectedEdge(null);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Workflow name is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (version < 1) errors.version = 'Version must be 1 or greater.';

    if (nodes.length === 0) {
      addToast('error', 'Workflow must contain at least one node.');
      return false;
    }

    const idSet = new Set<string>();
    for (const node of nodes) {
      if (idSet.has(node.id)) {
        addToast('error', `Duplicate node ID found: ${node.id}`);
        return false;
      }
      idSet.add(node.id);
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFieldErrors({});

    const payload: CreateWorkflowRequest = {
      metadata: {
        name: name.trim(),
        version: Number(version),
        description: description.trim(),
      },
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as NodeType,
        config: (n.data?.config as Record<string, unknown>) || {},
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        condition: (e.data?.condition as string) || (e.label as string) || null,
      })),
    };

    try {
      if (isEditMode && id) {
        await workflowService.update(id, payload);
        addToast('success', `Workflow "${name}" updated successfully.`);
      } else {
        await workflowService.create(payload);
        addToast('success', `Workflow "${name}" created successfully!`);
      }
      navigate('/workflows');
    } catch (err: unknown) {
      const apiErr = err as ApiErrorResponse;
      addToast('error', apiErr.message || 'Failed to save workflow.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Inject handleQuickConnect into node data dynamically before passing to ReactFlow
  const renderedNodes = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      onQuickConnect: handleQuickConnect,
    },
  }));

  if (isLoading) {
    return (
      <PageContainer title={isEditMode ? 'Edit Workflow' : 'Create Workflow'}>
        <Loader label="Loading workflow specification..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={isEditMode ? `Edit Workflow: ${name}` : 'Create Workflow Pipeline'}
      description="Design automated pipelines with visual drag-and-drop nodes, AI prompt routing, and branch conditions."
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button type="button" variant="secondary" onClick={() => navigate('/workflows')} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button type="button" variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? 'Saving Changes...'
                : 'Creating...'
              : isEditMode
                ? 'Save Changes'
                : 'Create Workflow'}
          </Button>
        </div>
      }
    >
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 1.4fr) minmax(90px, 0.6fr) minmax(280px, 2.5fr)',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* Workflow Name */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
              letterSpacing: '0.02em',
            }}
          >
            Workflow Name <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Customer Support Router"
            disabled={isSubmitting}
          />
          {fieldErrors.name && (
            <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
              {fieldErrors.name}
            </span>
          )}
        </div>

        {/* Version */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
              letterSpacing: '0.02em',
            }}
          >
            Version <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="number"
            min={1}
            className="input"
            value={version}
            onChange={(e) => setVersion(parseInt(e.target.value, 10) || 1)}
            disabled={isSubmitting}
          />
          {fieldErrors.version && (
            <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
              {fieldErrors.version}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
              letterSpacing: '0.02em',
            }}
          >
            Description <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="text"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this pipeline automates..."
            disabled={isSubmitting}
          />
          {fieldErrors.description && (
            <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
              {fieldErrors.description}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          height: '640px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <CanvasToolbar onAddNode={handleAddNode} onLoadTemplate={handleLoadTemplate} />

        <ReactFlow
          nodes={renderedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => {
            setSelectedNode(node);
            setSelectedEdge(null);
          }}
          onEdgeClick={(_, edge) => {
            setSelectedEdge(edge);
            setSelectedNode(null);
          }}
          onPaneClick={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
          fitView
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
        </ReactFlow>

        {selectedNode && (
          <NodeConfigDrawer
            key={selectedNode.id}
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdateConfig={handleUpdateConfig}
            onDeleteNode={handleDeleteNode}
          />
        )}

        {selectedEdge && (
          <EdgeConditionModal
            edge={selectedEdge}
            isOpen={Boolean(selectedEdge)}
            onClose={() => setSelectedEdge(null)}
            onSaveCondition={handleSaveEdgeCondition}
            onDeleteEdge={handleDeleteEdge}
          />
        )}
      </div>
    </PageContainer>
  );
}