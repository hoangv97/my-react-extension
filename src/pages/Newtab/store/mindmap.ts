import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from 'reactflow';
import { nanoid } from 'nanoid';

export type RFMindmapState = {
  mindmapNodes: Node[];
  mindmapEdges: Edge[];
  onMindmapNodesChange: OnNodesChange;
  onMindmapEdgesChange: OnEdgesChange;
  addMindmapChildNode: (parentNode: Node, position: XYPosition) => void;
  updateMindmapNodeLabel: (nodeId: string, label: string) => void;
  deleteMindmapNode: (nodeId: string) => void;
  addMindmapNode: (node: Node, position: XYPosition) => void;
  setMindmapData: (nodes: Node[], edges: Edge[]) => void;
};

export const selector = (state: RFMindmapState) => ({
  nodes: state.mindmapNodes,
  edges: state.mindmapEdges,
  onNodesChange: state.onMindmapNodesChange,
  onEdgesChange: state.onMindmapEdgesChange,
  addChildNode: state.addMindmapChildNode,
  updateNodeLabel: state.updateMindmapNodeLabel,
  deleteNode: state.deleteMindmapNode,
  addNode: state.addMindmapNode,
  setData: state.setMindmapData,
});

export const useMindmapSlice = (set: any, get: any) => ({
  mindmapNodes: [
    {
      id: 'root',
      type: 'mindmap',
      data: { label: 'React Flow Mind Map' },
      position: { x: 0, y: 0 },
    },
  ],
  mindmapEdges: [],
  setMindmapData: (nodes: Node[], edges: Edge[]) => {
    set({
      mindmapNodes: nodes,
      mindmapEdges: edges,
    });
  },
  onMindmapNodesChange: (changes: NodeChange[]) => {
    set({
      mindmapNodes: applyNodeChanges(changes, get().mindmapNodes),
    });
  },
  onMindmapEdgesChange: (changes: EdgeChange[]) => {
    set({
      mindmapEdges: applyEdgeChanges(changes, get().mindmapEdges),
    });
  },
  addMindmapChildNode: (parentNode: Node, position: XYPosition) => {
    const newNode = {
      id: nanoid(),
      type: 'mindmap',
      data: { label: 'New Node' },
      position,
      parentNode: parentNode.id,
    };

    const newEdge = {
      id: nanoid(),
      source: parentNode.id,
      target: newNode.id,
    };

    set({
      mindmapNodes: [...get().mindmapNodes, newNode],
      mindmapEdges: [...get().mindmapEdges, newEdge],
    });
  },
  updateMindmapNodeLabel: (nodeId: string, label: string) => {
    set({
      mindmapNodes: get().mindmapNodes.map((node: Node) => {
        if (node.id === nodeId) {
          // it's important to create a new object here, to inform React Flow about the changes
          node.data = { ...node.data, label };
        }

        return node;
      }),
    });
  },
  deleteMindmapNode: (nodeId: string) => {
    set({
      mindmapNodes: get().mindmapNodes.filter((node: Node) => node.id !== nodeId),
      mindmapEdges: get().mindmapEdges.filter((edge: Edge) => edge.source !== nodeId && edge.target !== nodeId),
    });
  },
  addMindmapNode: (node: Node, position: XYPosition) => {
    set({
      mindmapNodes: [...get().mindmapNodes, { ...node, id: nanoid(), position }],
    });
  },
}) as RFMindmapState;
