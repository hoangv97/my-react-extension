import { Handle, NodeProps, Position, NodeResizer } from 'reactflow';
import React from 'react';
import useStore from '../../store';
import { Input } from '@/components/ui/input';
import { selector } from '../../store/mindmap';
import { shallow } from 'zustand/shallow';

export type NodeData = {
  label: string;
};

function MindMapNode({ id, data, selected, ...others }: NodeProps<NodeData>) {
  const { updateNodeLabel, selectedNode, setSelectedNode } = useStore(
    selector,
    shallow
  );

  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />

      <Input
        defaultValue={data.label}
        className="w-full h-full font-sm resize-none focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
        onChange={(e) => {
          const newLabel = e.target.value;
          updateNodeLabel(id, newLabel);
          if (selectedNode) {
            setSelectedNode({
              ...selectedNode,
              data: { ...selectedNode.data, label: newLabel },
            });
          }
        }}
      />

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

export default MindMapNode;
