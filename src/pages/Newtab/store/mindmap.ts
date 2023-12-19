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

export type RFMindmapState = {
  mindmapLoadingStatus?: string;
  mindmapNodes: Node[];
  mindmapEdges: Edge[];
  onMindmapNodesChange: OnNodesChange;
  onMindmapEdgesChange: OnEdgesChange;
  addMindmapChildNode: (parentNode: Node, position: XYPosition) => void;
  updateMindmapNodeLabel: (nodeId: string, label: string) => void;
  deleteMindmapNode: (nodeId: string) => void;
  addMindmapNode: (node: Node, position: XYPosition) => void;
  setMindmapData: (nodes: Node[], edges: Edge[]) => void;
  generateMindmapNodes: (nodeId: string) => void;
};

export const selector = (state: RFMindmapState) => ({
  loadingStatus: state.mindmapLoadingStatus,
  nodes: state.mindmapNodes,
  edges: state.mindmapEdges,
  onNodesChange: state.onMindmapNodesChange,
  onEdgesChange: state.onMindmapEdgesChange,
  addChildNode: state.addMindmapChildNode,
  updateNodeLabel: state.updateMindmapNodeLabel,
  deleteNode: state.deleteMindmapNode,
  addNode: state.addMindmapNode,
  setData: state.setMindmapData,
  generateNodes: state.generateMindmapNodes,
});

const DEFAULT_ROOT_NAME = 'Enter something...';

export const useMindmapSlice = (set: any, get: any) => {

  return {
    mindmapNodes: [
      {
        id: 'root',
        type: 'mindmap',
        data: { label: DEFAULT_ROOT_NAME },
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
    generateMindmapNodes: async (nodeId: string) => {
      const selectedNode = get().mindmapNodes.find((node: Node) => node.id === nodeId);
      if (!selectedNode) return;
      if (selectedNode.data.label === DEFAULT_ROOT_NAME) {
        alert('Please change the root name!');
        return;
      }
      console.log(selectedNode);
      console.log(get().mindmapNodes, get().mindmapEdges);
      const children = get().mindmapNodes.filter((node: Node) => node.parentNode === nodeId);
      console.log(children);

      const getParentNode = (node: Node) => {
        const parentNode = get().mindmapNodes.find((n: Node) => n.id === node.parentNode);
        if (!parentNode) return;
        return parentNode;
      }

      const getAncestors = (node: Node): Node[] => {
        const parentNode = getParentNode(node);
        if (!parentNode) return [];
        return [parentNode, ...getAncestors(parentNode)];
      }

      const ancestors = getAncestors(selectedNode);

      let systemMessage = `
      You are a mindmap expert. You provide mindmap notes from user's request about any topics, keep notes' title concise and easy to understand for new learner.
      You MUST response with JSON format like this: {nodes: [{label, children:[]}]}.
      Only response with children of the provided node. If you don't have any children, response with empty array.`

      if (children.length) {
        const childrenLabels = children.map((node: Node) => node.data.label);
        systemMessage += `\nThe map already has these children: ${childrenLabels.join(', ')}. You need to exclude them from your response.`
      }
      if (ancestors.length) {
        const ancestorsLabels = ancestors.map((node: Node) => node.data.label);
        systemMessage += `\nCurrent node's ancestors: ${ancestorsLabels.join(', ')}. You can base on these to generate new nodes.`
      }

      const messages = [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: `Generate children nodes of this node: ${selectedNode.data.label}`,
        }
      ]

      set({
        mindmapLoadingStatus: 'Generating from OpenAI...',
      })
      const response = await openai.createChatCompletions({
        messages,
        model: 'gpt-4-1106-preview',
        response_format: { type: 'json_object' },
        max_tokens: 550,
      });
      console.log(response);

      set({
        mindmapLoadingStatus: undefined,
      })

      try {
        const { content } = response.choices[0].message;
        const parsedContent = JSON.parse(content);
        const { nodes } = parsedContent;

        const randomIntFromInterval = (min: number, max: number) => { // min and max included 
          return Math.floor(Math.random() * (max - min + 1) + min)
        }
        // add these new nodes to the map
        const addNewNodes = (nodes: any[], parentNode: Node) => {
          const newNodes = nodes.map((node: any) => ({
            id: nanoid(),
            type: 'mindmap',
            data: { label: node.label },
            position: {
              x: parentNode.position.x + randomIntFromInterval(40, 80),
              y: parentNode.position.y + randomIntFromInterval(40, 80),
            },
            parentNode: parentNode.id,
          }));
          const newEdges = newNodes.map((node: Node) => ({
            id: nanoid(),
            source: parentNode.id,
            target: node.id,
          }));
          set({
            mindmapNodes: [...get().mindmapNodes, ...newNodes],
            mindmapEdges: [...get().mindmapEdges, ...newEdges],
          });

          // recursively add children
          nodes.forEach((node: any, index: number) => {
            if (node.children && node.children.length > 0) {
              setTimeout(() => {
                addNewNodes(node.children, newNodes[index]);
              }, 1000);
            }
          });
        }

        addNewNodes(nodes, selectedNode);
      } catch (error) {
        console.log(error);
        alert('Something went wrong!');
      }
    }
  };
};
