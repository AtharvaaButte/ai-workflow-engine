
import React, { useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  type Node,
  type Edge,
  type OnConnect,
  BackgroundVariant,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { WorkflowNode, WorkflowEdge } from '../../types/workflow';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onChange?: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  isReadOnly?: boolean;
}

// 1. Custom Node with explicit Left (Input) and Right (Output) Handles
const CustomWorkflowNode = ({ data }: NodeProps) => {
  return (
    <div
      style={{
        background: '#1e293b',
        color: '#f8fafc',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '12px 18px',
        fontWeight: 600,
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        minWidth: '170px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Target Connection Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#3b82f6',
          width: 12,
          height: 12,
          left: -7,
          border: '2px solid #0f172a',
        }}
      />

      <div>{data.label as string}</div>

      {/* Source Connection Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#3b82f6',
          width: 12,
          height: 12,
          right: -7,
          border: '2px solid #0f172a',
        }}
      />
    </div>
  );
};

// Safe position calculator with spread layout
function getPosition(config: unknown, index: number): { x: number; y: number } {
  let parsed: Record<string, unknown> = {};
  if (typeof config === 'string') {
    try {
      parsed = JSON.parse(config);
    } catch {
      parsed = {};
    }
  } else if (typeof config === 'object' && config !== null) {
    parsed = config as Record<string, unknown>;
  }

  const pos = parsed.position as { x: number; y: number } | undefined;
  if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
    return pos;
  }

  // Vertical & Horizontal Grid Layout so nodes are spread out nicely
  return {
    x: 100 + (index % 2) * 280,
    y: 80 + Math.floor(index / 2) * 120,
  };
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes: incomingNodes = [],
  edges: incomingEdges = [],
  onChange,
  isReadOnly = false,
}) => {
  const nodeTypes = useMemo(() => ({ customNode: CustomWorkflowNode }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Prevent infinite loop re-renders when parent passes state back down
  const prevNodesLength = useRef<number>(0);

  // Sync incoming props when nodes are added or loaded initially
  useEffect(() => {
    // Only re-sync if the node count changed (e.g. user clicked "+ Add Node")
    if (incomingNodes.length === prevNodesLength.current && prevNodesLength.current > 0) {
      return;
    }

    prevNodesLength.current = incomingNodes.length;

    const rfNodes: Node[] = incomingNodes.map((n, idx) => ({
      id: String(n.id),
      type: 'customNode',
      position: getPosition(n.config, idx),
      data: {
        label: `${n.id} (${n.type})`,
      },
    }));

    const rfEdges: Edge[] = incomingEdges.map((e, idx) => ({
      id: `e-${e.source}-${e.target}-${idx}`,
      source: String(e.source),
      target: String(e.target),
      label: e.condition || undefined,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [incomingNodes, incomingEdges, setNodes, setEdges]);

  // Handle dragging single nodes independently
  const handleNodesChange: typeof onNodesChange = (changes) => {
    onNodesChange(changes);
    if (isReadOnly || !onChange) return;

    // Send position updates to parent form
    setNodes((currentRfNodes) => {
      const updatedWorkflowNodes: WorkflowNode[] = currentRfNodes.map((rfNode) => {
        const original = incomingNodes.find((n) => String(n.id) === rfNode.id);
        return {
          id: rfNode.id,
          type: original?.type,
          config: {
            ...(typeof original?.config === 'object' ? original.config : {}),
            position: { x: Math.round(rfNode.position.x), y: Math.round(rfNode.position.y) },
          },
        };
      });
      onChange(updatedWorkflowNodes, incomingEdges);
      return currentRfNodes;
    });
  };

  // Handle connecting node wire handles
  const onConnect: OnConnect = (connection) => {
    if (isReadOnly || !onChange || !connection.source || !connection.target) return;

    setEdges((prevEdges) => {
      const nextEdges = addEdge(connection, prevEdges);
      const updatedEdges: WorkflowEdge[] = nextEdges.map((e) => ({
        source: e.source,
        target: e.target,
        condition: typeof e.label === 'string' ? e.label : undefined,
      }));
      onChange(incomingNodes, updatedEdges);
      return nextEdges;
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: '520px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #334155',
        backgroundColor: '#0f172a',
        position: 'relative',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#334155" />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;