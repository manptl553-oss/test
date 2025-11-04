import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, Edge, MarkerType, MiniMap, Node, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import 'reactflow/dist/style.css';
import AddNodeButton from './AddNodeButton';
import NodeSidebar from './NodeSidebar';
import CustomEdge from './CustomEdge';
import CustomNode from './CustomNode';
import { useWorkflowStore } from '../../core/store/useWorkflowStore';
import { getAutoLayoutedElements } from '../../core/utils/layout';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

export function mapWorkflowToFlow(workflow: any, actions?: any) {
  const nodes: Node[] = []; const edges: Edge[] = []; if (!workflow) return { nodes, edges };
  const xSpacing = 320; const ySpacing = 180;
  if (workflow.triggers?.length > 0) {
    const trigger = workflow.triggers[0];
    nodes.push({ id: trigger.id, type: 'custom', data: { id: trigger.id, name: trigger.name || 'Event Trigger', type: trigger.type, configuration: trigger.configuration, outputs: ['next'], backend_id: trigger.id, ...actions }, position: { x: 100, y: 200 } });
  }
  workflow.nodes?.forEach((wfNode: any, index: number) => {
    let outputs: string[] = ['next'];
    switch (wfNode.type) { case 'conditional': case 'rule_executor': outputs = ['on_true', 'on_false']; break; case 'switch': outputs = wfNode.config?.switch_cases?.map((c: any) => c.condition) || []; break; case 'loop': outputs = ['next']; break; default: outputs = ['next']; }
    nodes.push({ id: wfNode.id, type: 'custom', data: { id: wfNode.id, name: wfNode.name, type: wfNode.type, configuration: wfNode.config, outputs, ...actions, backend_id: wfNode.id }, position: { x: 400 + (index % 3) * xSpacing, y: 100 + Math.floor(index / 3) * ySpacing } });
  });
  const seen = new Set<string>();
  workflow.edges?.forEach((e: any) => {
    const edgeId = e.id || `${e.source}-${e.target}-${e.condition || 'next'}`; if (seen.has(edgeId)) return; seen.add(edgeId);
    edges.push({ id: edgeId, source: e.source, target: e.target, sourceHandle: e.condition || 'next', targetHandle: 'input', type: 'custom', animated: true, style: { strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed }, data: e.data });
  });
  if (workflow.triggers?.length > 0 && workflow.nodes?.length > 0) {
    const triggerId = workflow.triggers[0].id; const existingTargets = new Set(workflow.edges?.map((e: any) => e.target));
    const firstNodes = workflow.nodes.filter((n: any) => !existingTargets.has(n.id));
    firstNodes.forEach((n: any) => { const edgeId = `edge-trigger-${n.id}`; if (!seen.has(edgeId)) { edges.push({ id: edgeId, source: triggerId, target: n.id, type: 'custom', animated: true, style: { strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed } }); } });
  }
  return { nodes, edges };
}

export default function FlowCanvas({ workflow }: any) {
  const { setNodes, setEdges, nodes, edges, onNodesChange, onEdgesChange, onConnect, setSourceNodeId, setSourceHandleId, setShowSidebar, showSidebar, deleteNode, renameNode } = useWorkflowStore();
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [isLayouting, setIsLayouting] = useState(false);
  const isEditMode = !!workflow?.id;
  const handleDeleteClick = useCallback((nodeId: string) => deleteNode(nodeId), [deleteNode]);
  const handleAddClick = useCallback((nodeId: string, handleId: string) => { setSourceNodeId(nodeId); setSourceHandleId(handleId); setShowSidebar(true); }, [setSourceNodeId, setSourceHandleId, setShowSidebar]);
  const updateNodeInternals = useUpdateNodeInternals();
  const { setUpdateNodeInternals } = useWorkflowStore();
  useEffect(() => { setUpdateNodeInternals((id: string) => updateNodeInternals(id)); }, [setUpdateNodeInternals, updateNodeInternals]);
  useEffect(() => {
    const { nodes, edges } = isEditMode ? mapWorkflowToFlow(workflow, { onAddClick: handleAddClick, onDeleteClick: handleDeleteClick, onRename: renameNode }) : { nodes: [], edges: [] };
    setNodes(nodes); setEdges(edges);
  }, [workflow, isEditMode, handleAddClick, handleDeleteClick, renameNode, setNodes, setEdges]);
  const handleAutoLayout = useCallback(() => { setIsLayouting(true); setTimeout(() => { const { nodes: layoutedNodes, edges: layoutedEdges } = getAutoLayoutedElements(nodes, edges); setNodes(layoutedNodes); setEdges(layoutedEdges); fitView({ padding: 0.2 }); setIsLayouting(false); }, 100); }, [nodes, edges, setNodes, setEdges, fitView]);
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow'); const nodeType = e.dataTransfer.getData('nodeType'); const nodeName = e.dataTransfer.getData('nodeName');
    if (!type && !nodeType) return; const position = screenToFlowPosition({ x: e.clientX, y: e.clientY }); const id = `${type || nodeType}-${crypto.randomUUID()}`;
    const newNode: Node = { id, type: 'custom', position, data: { id, name: nodeName || type, type: nodeType, onAddClick: handleAddClick, onDeleteClick: deleteNode, onRename: renameNode } };
    const { addNode, addNodeAfter, addNodeBetweenEdge, clearSource } = useWorkflowStore.getState();
    const sourceNodeId = e.dataTransfer.getData('sourceNodeId'); const sourceHandleId = e.dataTransfer.getData('sourceHandleId'); const sourceEdgeId = e.dataTransfer.getData('sourceEdgeId');
    if (sourceEdgeId && sourceNodeId) addNodeBetweenEdge(newNode); else if (sourceNodeId) addNodeAfter(newNode, sourceNodeId, sourceHandleId || 'done'); else addNode(newNode);
    clearSource?.(); setShowSidebar(false);
  }, [screenToFlowPosition, handleAddClick, deleteNode, renameNode, setShowSidebar]);
  const nodesWithData = useMemo(() => nodes.map((n) => ({ ...n, data: { ...n.data, isLoop: (n.data as any).type === 'loop', onAddClick: handleAddClick, onDeleteClick: handleDeleteClick, onRename: renameNode } })), [nodes, handleAddClick, handleDeleteClick, renameNode]);
  const edgesWithData = useMemo(() => edges.map((e) => ({ ...e, type: 'custom', markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 } })), [edges]);
  return (
    <div className="w-full h-full bg-white relative">
      <ReactFlow nodes={nodesWithData} edges={edgesWithData} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver} fitView className="bg-white" connectionLineStyle={{ stroke: '#4b5563', strokeWidth: 2 }} proOptions={{ hideAttribution: true }}>
        <MiniMap /> <Controls /> <Background />
      </ReactFlow>
      <div className="absolute bottom-4 left-4 z-20">
        <button className="bg-white border rounded-md shadow px-2 py-1 text-sm" onClick={handleAutoLayout}>Auto Layout</button>
      </div>
      {showSidebar && <NodeSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />}
      {nodes.length === 0 && <AddNodeButton onClick={() => setShowSidebar(true)} />}
    </div>
  );
}
