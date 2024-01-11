import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ArrowUpRightSquareIcon } from 'lucide-react';
import { Editor } from 'novel';
import React, { useCallback, useEffect, useState } from 'react';
import { Node, Panel } from 'reactflow';
import { shallow } from 'zustand/shallow';
import useStore from '../../store';
import { selector } from '../../store/mindmap';

export default function NodeDetail() {
  const { selectedNode, nodes, edges, setData, setSelectedNode } = useStore(
    selector,
    shallow
  );

  const [open, setOpen] = useState(false);
  const [sources, setSources] = useState<Node[]>([]);
  const [targets, setTargets] = useState<Node[]>([]);

  useEffect(() => {
    if (selectedNode) {
      const sources = edges
        .filter((edge) => edge.target === selectedNode.id)
        .map((edge) => nodes.find((node) => node.id === edge.source))
        .filter((node) => !!node) as Node[];
      const targets = edges
        .filter((edge) => edge.source === selectedNode.id)
        .map((edge) => nodes.find((node) => node.id === edge.target))
        .filter((node) => !!node) as Node[];
      setSources(sources);
      setTargets(targets);
    }
  }, [selectedNode, nodes, edges, open]);

  const selectOtherNode = useCallback(
    (node: Node) => {
      setSelectedNode(node);
      setOpen(false);
    },
    [setSelectedNode]
  );

  if (!selectedNode) {
    return null;
  }

  return (
    <Panel position="bottom-center">
      <Card>
        <CardContent className="flex gap-10 justify-between items-center p-2 pt-2 ml-5">
          <div className="text-sm">{selectedNode.data.label}</div>
          <Button
            size={'icon'}
            variant={'ghost'}
            onClick={() => {
              setOpen(true);
            }}
          >
            <ArrowUpRightSquareIcon />
          </Button>
        </CardContent>
      </Card>
      <Sheet open={open} onOpenChange={(val) => setOpen(val)}>
        <SheetContent className="p-0 sm:max-w-xl">
          <SheetHeader className="px-6 pt-3 pb-0">
            <SheetTitle>{selectedNode.data.label}</SheetTitle>
          </SheetHeader>
          <Separator className="mt-3" />
          <ScrollArea className="h-[calc(100vh_-_55px)]">
            <Editor
              defaultValue={selectedNode.data.content || ''}
              onDebouncedUpdate={(editor) => {
                setData(
                  nodes.map((node) => {
                    if (node.id === selectedNode.id) {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          content: editor?.getJSON(),
                        },
                      };
                    }
                    return node;
                  }),
                  edges
                );
              }}
              disableLocalStorage={true}
              className="relative min-h-[500px] mb-5 w-full max-w-screen-lg bg-background"
            />
            <div className="px-6">
              {sources.length > 0 && (
                <>
                  <div className="text-lg">References</div>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((node) => (
                      <Button
                        key={node.id}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          selectOtherNode(node);
                        }}
                      >
                        {node.data.label}
                      </Button>
                    ))}
                  </div>
                </>
              )}
              {targets.length > 0 && (
                <>
                  <div className="text-lg">Referenced by</div>
                  <div className="flex flex-wrap gap-2">
                    {targets.map((node) => (
                      <Button
                        key={node.id}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          selectOtherNode(node);
                        }}
                      >
                        {node.data.label}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </Panel>
  );
}
