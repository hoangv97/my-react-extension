import storage from '@/lib/storage';
import { nanoid } from 'nanoid';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  Node,
  NodeOrigin,
  OnConnectEnd,
  OnConnectStart,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  useStoreApi,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { shallow } from 'zustand/shallow';
import useStore from '../../store';
import {
  DEFAULT_ROOT_NODE,
  LOADING_STATUS_MESSAGES,
  selector,
} from '../../store/mindmap';
import ContextMenu from './context-menu';
import { ListDialog } from './dialogs/list';
import { SaveDialog } from './dialogs/save';
import MindMapEdge from './edge';
import MindMapNode from './node';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import NodeDetail from './node-detail';
import { LAYOUT_OPTIONS } from './lib/layout';

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = {
  // stroke: '#F6AD55',
  strokeWidth: 1,
};
const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

interface MindmapProps {
  isFullScreen: boolean;
}

const Mindmap = ({ isFullScreen }: MindmapProps) => {
  const [menu, setMenu] = useState<any>(null);
  const ref = useRef<any>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addChildNode,
    setData,
    loadingStatus,
    config,
    setConfig,
    currentFile,
    setCurrentFile,
    setSelectedNode,
  } = useStore(selector, shallow);
  const connectingNodeId = useRef<string | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openFileListDialog, setOpenFileListDialog] = useState(false);

  const store = useStoreApi();
  const { screenToFlowPosition, setViewport, fitView } = useReactFlow();

  useEffect(() => {
    if (loadingStatus === LOADING_STATUS_MESSAGES.generatingNodes) {
      fitView();
    }
  }, [nodes, edges, loadingStatus]);

  const getChildNodePosition = (event: MouseEvent, parentNode?: Node) => {
    const { domNode } = store.getState();

    if (
      !domNode ||
      // we need to check if these properties exist, because when a node is not initialized yet,
      // it doesn't have a positionAbsolute nor a width or height
      !parentNode?.positionAbsolute ||
      !parentNode?.width ||
      !parentNode?.height
    ) {
      return;
    }

    const panePosition = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // we are calculating with positionAbsolute here because child nodes are positioned relative to their parent
    return {
      x: panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
      y: panePosition.y - parentNode.positionAbsolute.y + parentNode.height / 2,
    };
  };

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);

        if (parentNode && childNodePosition) {
          addChildNode(parentNode, childNodePosition);
        }
      }
    },
    [getChildNodePosition]
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setMenu]
  );

  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const onSaveAsNewFile = useCallback(
    (state: any) => {
      if (rfInstance) {
        const data = rfInstance.toObject();
        const mindmapList = storage.getLocalStorage(
          storage.KEYS.mindmapData,
          []
        );
        const saveFile = {
          id: nanoid(),
          name: state.name,
          data: JSON.stringify(data),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storage.setLocalStorage(storage.KEYS.mindmapData, [
          ...mindmapList,
          saveFile,
        ]);
      }
    },
    [rfInstance]
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      const data = rfInstance.toObject();
      const mindmapList = storage.getLocalStorage(storage.KEYS.mindmapData, []);
      const saveFile = {
        ...currentFile,
        data: JSON.stringify(data),
        updatedAt: new Date().toISOString(),
      };
      const newFiles = mindmapList.map((file: any) =>
        file.id === saveFile.id ? saveFile : file
      );
      storage.setLocalStorage(storage.KEYS.mindmapData, newFiles);
      alert(`Saved ${saveFile.name}`);
    }
  }, [rfInstance]);

  const onRestore = useCallback(
    (file: any) => {
      const restoreFlow = async () => {
        setCurrentFile(file);
        const flow = JSON.parse(file.data);

        if (flow) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport;
          setData(flow.nodes || [], flow.edges || []);
          setViewport({ x, y, zoom });
        }
      };

      restoreFlow();
    },
    [setData, setViewport]
  );

  return (
    <ReactFlow
      ref={ref}
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      onEdgesChange={onEdgesChange}
      onInit={setRfInstance}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={nodeOrigin}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onNodeContextMenu={onNodeContextMenu}
      onPaneClick={onPaneClick}
      connectionLineStyle={connectionLineStyle}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineType={ConnectionLineType.Straight}
      fitView
      onNodeClick={(event, node) => {
        setSelectedNode(node);
      }}
    >
      <Background />
      {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
      <Controls />
      <Panel position="top-left">
        <div className="flex gap-2 z-50">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() => {
                    setData([DEFAULT_ROOT_NODE], []);
                    setViewport({ x: 0, y: 0, zoom: 1 });
                  }}
                >
                  New File <MenubarShortcut>⌘N</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => setOpenFileListDialog(true)}>
                  Files <MenubarShortcut>⌘O</MenubarShortcut>
                </MenubarItem>
                {!!currentFile && (
                  <MenubarItem onClick={onSave}>Save</MenubarItem>
                )}
                <MenubarItem onClick={() => setOpenSaveDialog(true)}>
                  Save as new file <MenubarShortcut>⌘S</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Find</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent>
                <MenubarSub>
                  <MenubarSubTrigger>Layout Options</MenubarSubTrigger>
                  <MenubarSubContent>
                    {LAYOUT_OPTIONS.map((option) => (
                      <MenubarCheckboxItem
                        key={option.value}
                        checked={config.layoutOption === option.value}
                        onClick={() => setConfig('layoutOption', option.value)}
                      >
                        {option.label}
                      </MenubarCheckboxItem>
                    ))}
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarItem>Update Layout</MenubarItem>
                <MenubarSeparator />
                <MenubarCheckboxItem
                  checked={config.showMinimap}
                  onCheckedChange={(val) => setConfig('showMinimap', val)}
                >
                  Show Minimap
                </MenubarCheckboxItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          {openSaveDialog && (
            <SaveDialog
              onSave={onSaveAsNewFile}
              onClose={() => setOpenSaveDialog(false)}
            />
          )}
          {openFileListDialog && (
            <ListDialog
              onRestore={onRestore}
              onClose={() => setOpenFileListDialog(false)}
            />
          )}
        </div>
      </Panel>
      <Panel position="top-right">
        <div>{loadingStatus}</div>
      </Panel>
      {!!config.showMinimap && isFullScreen && <MiniMap />}
      <NodeDetail />
    </ReactFlow>
  );
};

export default ({ isFullScreen }: MindmapProps) => {
  return (
    <ReactFlowProvider>
      <Mindmap isFullScreen={isFullScreen} />
    </ReactFlowProvider>
  );
};
