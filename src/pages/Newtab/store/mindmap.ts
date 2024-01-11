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
import openai from '@/lib/openai';
import {
  LAYOUT_OPTIONS,
  updateD3Layout,
  updateDagreLayout,
  updateElkLayout,
} from '../components/mindmap/lib/layout';

export type MindmapConfigState = {
  layoutOption: string;
  showMinimap: boolean;
};

export type RFMindmapState = {
  mindmapLoadingStatus?: string;
  mindmapNodes: Node[];
  mindmapEdges: Edge[];
  mindmapConfig: MindmapConfigState;
  mindmapCurrentFile?: any;
  mindmapSelectedNode?: Node;
  onMindmapNodesChange: OnNodesChange;
  onMindmapEdgesChange: OnEdgesChange;
  addMindmapChildNode: (parentNode: Node, position: XYPosition) => void;
  updateMindmapNodeLabel: (nodeId: string, label: string) => void;
  deleteMindmapNode: (nodeId: string) => void;
  addMindmapNode: (node: Node, position: XYPosition) => void;
  setMindmapData: (nodes: Node[], edges: Edge[]) => void;
  generateMindmapNodes: (nodeId: string) => void;
  setMindmapLayout: () => void;
  setMindmapConfig: (key: string, value: any) => void;
  setMindmapCurrentFile: (file: any) => void;
  setMindmapSelectedNode: (node?: Node) => void;
};

export const selector = (state: RFMindmapState) => ({
  loadingStatus: state.mindmapLoadingStatus,
  nodes: state.mindmapNodes,
  edges: state.mindmapEdges,
  config: state.mindmapConfig,
  currentFile: state.mindmapCurrentFile,
  selectedNode: state.mindmapSelectedNode,
  onNodesChange: state.onMindmapNodesChange,
  onEdgesChange: state.onMindmapEdgesChange,
  addChildNode: state.addMindmapChildNode,
  updateNodeLabel: state.updateMindmapNodeLabel,
  deleteNode: state.deleteMindmapNode,
  addNode: state.addMindmapNode,
  setData: state.setMindmapData,
  generateNodes: state.generateMindmapNodes,
  setLayout: state.setMindmapLayout,
  setConfig: state.setMindmapConfig,
  setCurrentFile: state.setMindmapCurrentFile,
  setSelectedNode: state.setMindmapSelectedNode,
});

const DEFAULT_ROOT_NAME = 'New Node';

export const DEFAULT_ROOT_NODE: Node = {
  id: 'root',
  type: 'mindmap',
  data: { label: DEFAULT_ROOT_NAME },
  position: { x: 0, y: 0 },
};

export const LOADING_STATUS_MESSAGES = {
  callingOpenAI: 'Calling OpenAI...',
  generatingNodes: 'Generating nodes...',
};

export const useMindmapSlice = (set: any, get: any) => {
  return {
    mindmapConfig: {
      layoutOption: LAYOUT_OPTIONS[4].value,
      showMinimap: true,
    },
    mindmapNodes: [],
    mindmapEdges: [],
    setMindmapConfig: (key: string, value: any) => {
      set({
        mindmapConfig: {
          ...get().mindmapConfig,
          [key]: value,
        },
      });
    },
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
        mindmapNodes: get().mindmapNodes.filter(
          (node: Node) => node.id !== nodeId
        ),
        mindmapEdges: get().mindmapEdges.filter(
          (edge: Edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      });
    },
    addMindmapNode: (node: Node, position: XYPosition) => {
      set({
        mindmapNodes: [
          ...get().mindmapNodes,
          { ...node, id: nanoid(), position },
        ],
      });
    },
    generateMindmapNodes: async (nodeId: string) => {
      const selectedNode = get().mindmapNodes.find(
        (node: Node) => node.id === nodeId
      );
      if (!selectedNode) return;
      if (selectedNode.data.label === DEFAULT_ROOT_NAME) {
        alert('Please change the root name!');
        return;
      }
      const children = get().mindmapNodes.filter(
        (node: Node) => node.parentNode === nodeId
      );

      const getParentNode = (node: Node) => {
        const parentNode = get().mindmapNodes.find(
          (n: Node) => n.id === node.parentNode
        );
        if (!parentNode) return;
        return parentNode;
      };

      const getAncestors = (node: Node): Node[] => {
        const parentNode = getParentNode(node);
        if (!parentNode) return [];
        return [parentNode, ...getAncestors(parentNode)];
      };

      const ancestors = getAncestors(selectedNode);

      let systemMessage = `
      You are a mindmap expert. You provide mindmap notes from user's request about any topics, keep notes' title concise and easy to understand for new learner.
      You MUST response with JSON format like this: {nodes: [{label, children:[]}]}.
      Only response with children of the provided node. If you don't have any children, response with empty array.`;

      if (children.length) {
        const childrenLabels = children.map((node: Node) => node.data.label);
        systemMessage += `\nThe map already has these children: ${childrenLabels.join(
          ', '
        )}. You need to exclude them from your response.`;
      }
      if (ancestors.length) {
        const ancestorsLabels = ancestors.map((node: Node) => node.data.label);
        systemMessage += `\nCurrent node's ancestors: ${ancestorsLabels.join(
          ', '
        )}. You can base on these to generate new nodes.`;
      }

      const messages = [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: `Generate children nodes of this node: ${selectedNode.data.label}`,
        },
      ];

      set({
        mindmapLoadingStatus: LOADING_STATUS_MESSAGES.callingOpenAI,
      });
      const response = await openai.createChatCompletions({
        messages,
        model: 'gpt-4-1106-preview',
        response_format: { type: 'json_object' },
        max_tokens: 550,
      });

      set({
        mindmapLoadingStatus: undefined,
      });

      try {
        const { content } = response.choices[0].message;
        const parsedContent = JSON.parse(content);
        const { nodes } = parsedContent;
        console.log('nodes', nodes);

        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

        // add these new nodes to the map
        const addNewNodes = async (nodes: any[], parentNode: Node) => {
          set({
            mindmapLoadingStatus: LOADING_STATUS_MESSAGES.generatingNodes,
          });

          // add new nodes as a circle around the parent node
          const newNodes = nodes.map((node: any, i: number) => ({
            id: nanoid(),
            type: 'mindmap',
            data: { label: node.label },
            position: {
              x: parentNode.position.x + 10,
              y: parentNode.position.y + 10,
            },
            parentNode: parentNode.id,
          }));
          const newEdges = newNodes.map((node: Node) => ({
            id: nanoid(),
            source: parentNode.id,
            target: node.id,
          }));

          // add new nodes to the map by timeout
          const updateNodes = [...get().mindmapNodes, ...newNodes];
          const updateEdges = [...get().mindmapEdges, ...newEdges];

          let layoutNodes: Node[] = [];
          let layoutEdges: Edge[] = [];

          const selectedLayoutOption = get().mindmapSelectedLayoutOption;
          if (selectedLayoutOption === 'dagre') {
            const result = updateDagreLayout(updateNodes, updateEdges, {
              rankdir: 'TB',
              ranker: 'tight-tree',
              ranksep: 20,
              nodesep: 20,
            });
            layoutNodes = result.nodes;
            layoutEdges = result.edges;
          } else if (selectedLayoutOption === 'd3') {
            const result = updateD3Layout(updateNodes, updateEdges, {});
            layoutNodes = result.nodes;
            layoutEdges = result.edges;
          } else {
            let options = {};
            if (selectedLayoutOption === 'elk_vertical') {
              options = { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN' };
            } else if (selectedLayoutOption === 'elk_horizontal') {
              options = {
                'elk.algorithm': 'layered',
                'elk.direction': 'RIGHT',
              };
            } else if (selectedLayoutOption === 'elk_radial') {
              options = { 'elk.algorithm': 'org.eclipse.elk.radial' };
            } else if (selectedLayoutOption === 'elk_force') {
              options = { 'elk.algorithm': 'org.eclipse.elk.force' };
            }
            const result = await updateElkLayout(
              updateNodes,
              updateEdges,
              options
            );
            layoutNodes = result.nodes;
            layoutEdges = result.edges;
          }

          set({
            mindmapNodes: layoutNodes,
            mindmapEdges: layoutEdges,
            mindmapLoadingStatus: undefined,
          });

          // recursively add children
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.children && node.children.length > 0) {
              await sleep(500);
              addNewNodes(node.children, newNodes[i]);
            }
          }
        };

        addNewNodes(nodes, selectedNode);
      } catch (error) {
        console.log(error);
        alert('Something went wrong!');
      }
    },
    setMindmapCurrentFile: (file: any) => {
      set({
        mindmapCurrentFile: file,
      });
    },
    setMindmapSelectedNode: (node?: Node) => {
      set({
        mindmapSelectedNode: node,
      });
    },
  };
};
