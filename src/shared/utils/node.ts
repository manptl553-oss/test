import { Edge, Node } from "reactflow";
import { NODE_DEFINITIONS } from "../constants";
import { NodeDefinition } from "../types";
import { v4 as uuidv4 } from "uuid";
import { NodeData } from "@/store";

export const getNodeDefinition = (type?: string): NodeDefinition => {
  const key = type?.toLowerCase?.();
  if (!key) {
    return { outputs: ["none"], defaultTarget: "input" };
  }

  return (
    NODE_DEFINITIONS[key as keyof typeof NODE_DEFINITIONS] ?? {
      outputs: ["none"],
      defaultTarget: "input",
    }
  );
};

export const getOutputsForNode = (node: any): string[] => {
  const type = node?.data?.type?.toLowerCase();
  const def = getNodeDefinition(type);

  if (type === "switch") {
    const cases = node?.data?.configuration?.switchCases;
    if (Array.isArray(cases) && cases.length > 0)
      return cases.map((c: any, i: number) => c?.condition || `case_${i + 1}`);
    return ["case_1"];
  }

  return def.outputs;
};

export const getTargetHandleForNode = (node: any): string =>
  getNodeDefinition(node?.data?.type).defaultTarget;

export const getSelfLoopHandle = (node: any): string | null =>
  getNodeDefinition(node?.data?.type).selfLoopHandle ?? null;

export const getEdgeLabelForNode = (
  node: any,
  handle?: string
): string | undefined => {
  if (!handle) return;
  const normalized = handle.toLowerCase().replace(/^on_/, "");

  const def = getNodeDefinition(node?.data?.type);

  // Static labels
  if (def.labels?.[normalized]) return def.labels[normalized];

  // Dynamic switch case: case_1 → Case 1
  if (normalized.startsWith("case_")) {
    const num = normalized.split("_")[1];
    return `Case ${num}`;
  }

  return undefined;
};

// ✅ Includes old trigger logic + extended support
export const isTriggerNode = (nodeType?: string): boolean => {
  if (!nodeType) return false;
  const type = nodeType.toLowerCase?.();
  return ["webhook", "event", "schedule", "trigger", "cron","http_request"].includes(type);
};


export const handleLoopNodeTopology = ({
  mergedNode,
  oldNodeId,
  nodes,
  edges,
  currentVersion,
  getNewNode,
  trackDeletedEdges,
}: {
  mergedNode: Node<NodeData>;
  oldNodeId: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  currentVersion: any;
  getNewNode: (pos: { x: number; y: number }) => Node<NodeData>;
  trackDeletedEdges: (edges: Edge[]) => void;
}) => {
  // 1. Enforce Loop Outputs
  mergedNode.data.outputs = ['body', 'end'];

  // ------------------------------------------------------------------
  // 2. CLEANUP LOGIC (Same as your original code)
  // ------------------------------------------------------------------
  const outgoingEdges = edges.filter(
    (e) => e.source === mergedNode.id || e.source === oldNodeId
  );

  const nodesToDelete = new Set<string>();

  outgoingEdges.forEach((edge) => {
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!targetNode) return;

    const isPlaceholder = 
        targetNode.data?.type === 'void_node' || 
        targetNode.data?.type === 'addNode';

    if (isPlaceholder) {
      const otherIncoming = edges.filter(
        (e) =>
          e.target === targetNode.id &&
          e.source !== mergedNode.id &&
          e.source !== oldNodeId
      );

      if (otherIncoming.length === 0) {
        nodesToDelete.add(targetNode.id);
      }
    }
  });

  const edgesToKeep = edges.filter((e) => {
    const isOutgoing = e.source === mergedNode.id || e.source === oldNodeId;
    const isConnectedToDeleted = nodesToDelete.has(e.source) || nodesToDelete.has(e.target);
    return !isOutgoing && !isConnectedToDeleted;
  });

  const deletedEdgesList = edges.filter((e) => !edgesToKeep.includes(e));
  trackDeletedEdges(deletedEdgesList);

  // ------------------------------------------------------------------
  // 3. CREATE LOOP STRUCTURE
  // ------------------------------------------------------------------
  
  // Calculate Parent Context
  // If the Loop node itself is inside another loop, it has a parentLoop.
  const containerLoopId = mergedNode.data.parentLoop;

  // 1. Create Self-Loop Edge (The "Body" of this specific loop)
  // CRITICAL: This edge belongs to the Loop itself, so groupId = mergedNode.id
  const selfEdge = {
    id: uuidv4(),
    type: 'custom',
    source: mergedNode.id,
    target: mergedNode.id,
    sourceHandle: 'body',
    targetHandle: 'body',
    animated: true,
    data: {
      loopType: 'self',
      loopOwner: mergedNode.id,
      groupId: mergedNode.id, // <--- Group ID set to self (the loop ID)
      versionId: currentVersion?.id,
    },
  };

  const x = mergedNode.position.x;
  const y = mergedNode.position.y;

  const loopNodesToAdd: Node<NodeData>[] = [];
  const loopEdgesToAdd: Edge[] = [selfEdge];
  let updatedEdges = edgesToKeep; 

  // Check for Nested Loop Logic (If the node we just turned into a loop was already inside a loop)
  if (containerLoopId) {
    const parentLoop = nodes.find((n) => n.id === containerLoopId);
    
    if (parentLoop) {
      // Rewire incoming edge from Outer Parent -> New Loop (Inner)
      // These edges exist inside the Outer Parent, so groupId = containerLoopId
      updatedEdges = updatedEdges.map((e) => {
        if (e.source === parentLoop.id && e.target === mergedNode.id) {
          return { 
            ...e, 
            targetHandle: 'input', 
            data: { 
                ...e.data, 
                loopType: 'loop-child',
                groupId: containerLoopId // Belongs to outer loop
            } 
          };
        }
        return e;
      });

      // Internal Dummy for Nested Loop Flow
      const doneDummy = getNewNode({ x: x + 260, y: y });
      
      // The dummy node is visually inside the Outer Loop, but logic-wise attached to the Inner Loop
      // Usually, it stays in the scope of the Outer Loop
      doneDummy.data.parentLoop = containerLoopId; 
      loopNodesToAdd.push(doneDummy);

      // Edge: Inner Loop (End) -> Dummy
      // This transition happens inside the Outer Loop context
      loopEdgesToAdd.push({
        id: uuidv4(), type: 'custom', source: mergedNode.id, target: doneDummy.id,
        sourceHandle: 'end', targetHandle: 'input', animated: true,
        data: { 
            loopType: 'loop-child', 
            versionId: currentVersion?.id,
            groupId: containerLoopId // Inside Outer Loop
        },
      });

      // Edge: Dummy -> Outer Loop (Loop Back)
      // This returns to the start of the Outer Loop
      loopEdgesToAdd.push({
        id: uuidv4(), type: 'custom', source: doneDummy.id, target: parentLoop.id,
        sourceHandle: 'none', targetHandle: 'body', animated: true,
        data: { 
            loopType: 'loop-back', 
            versionId: currentVersion?.id,
            groupId: containerLoopId // Inside Outer Loop
        },
      });
    }
  } else {
    // Standard Root Loop (Not nested)
    const doneNode = getNewNode({ x: x + 260, y: y });
    
    // The "Done" node is usually effectively outside the loop body, 
    // or logically a sibling in the main flow. 
    // If you want it grouped, set parentLoop. If it's the "End of Loop", keep it null or parentLoop of current node.
    doneNode.data.parentLoop = mergedNode.data.parentLoop; 
    loopNodesToAdd.push(doneNode);

    const endEdge = {
      id: uuidv4(),
      type: 'custom',
      animated: true,
      source: mergedNode.id,
      target: doneNode.id,
      sourceHandle: 'end',
      targetHandle: 'input',
      data: { 
          loopType: 'end', 
          versionId: currentVersion?.id,
          // groupId: mergedNode.id // UNCOMMENT if the "End" line is considered inside the loop
      },
    };
    loopEdgesToAdd.push(endEdge);
  }

  // ------------------------------------------------------------------
  // 4. FINAL MERGE
  // ------------------------------------------------------------------
  const finalNodes = nodes
    .filter((n) => !nodesToDelete.has(n.id)) 
    .map((n) => (n.id === oldNodeId ? mergedNode : n))
    .concat(loopNodesToAdd);

  return {
    nodes: finalNodes,
    edges: [...updatedEdges, ...loopEdgesToAdd],
  };
};