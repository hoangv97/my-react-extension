import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import React, { useEffect } from 'react';

const defaultBackgrounds = [
  { name: 'Default', value: '' },
  { name: 'Zinc', value: 'hsl(240 5.9% 10%)' },
  { name: 'Red', value: 'hsl(0 72.2% 50.6%)' },
  { name: 'Rose', value: 'hsl(346.8 77.2% 49.8%)' },
  { name: 'Orange', value: 'hsl(20.5 90.2% 48.2%)' },
  { name: 'Green', value: 'hsl(142.1 70.6% 45.3%)' },
  { name: 'Blue', value: 'hsl(217.2 91.2% 59.8%)' },
  { name: 'Yellow', value: 'hsl(47.9 95.8% 53.1%)' },
  { name: 'Violet', value: 'hsl(263.4 70% 50.4%)' },
];

const defaultColors = [
  { name: 'Default', value: '' },
  { name: 'White', value: 'hsl(0 0% 100%)' },
  { name: 'Black', value: 'hsl(0 0% 0%)' },
];

interface DataProps {
  background?: string;
  color?: string;
}

interface NodeStyleDialogProps {
  nodeId: string;
  nodeData: any;
  onSave: (nodeId: string, data: DataProps) => void;
  onClose: () => void;
}

export default function NodeStyleDialog({
  nodeId,
  nodeData,
  onSave,
  onClose,
}: NodeStyleDialogProps) {
  const [state, setState] = React.useState<DataProps>({
    background: '',
    color: '',
  });
  const [open, setOpen] = React.useState(true);

  useEffect(() => {
    if (!open) {
      onClose();
    }
  }, [open]);

  useEffect(() => {
    if (nodeData) {
      setState(nodeData);
    }
  }, [nodeData]);

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit node style</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div>
            <div className="text-sm mb-2">Background</div>
            <div className="flex flex-wrap gap-2">
              {defaultBackgrounds.map((color) => (
                <Button
                  size={'sm'}
                  variant={
                    state.background === color.value ? 'default' : 'outline'
                  }
                  onClick={() => {
                    setState({ ...state, background: color.value });
                  }}
                >
                  {!!color.value && (
                    <div
                      className="h-5 w-5 rounded-full mr-1"
                      style={{ background: color.value }}
                    ></div>
                  )}
                  {color.name}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm mb-2">Color</div>
            <div className="flex flex-wrap gap-2">
              {defaultColors.map((color) => (
                <Button
                  size={'sm'}
                  variant={state.color === color.value ? 'default' : 'outline'}
                  onClick={() => {
                    setState({ ...state, color: color.value });
                  }}
                >
                  {!!color.value && (
                    <div
                      className="h-5 w-5 rounded-full mr-1"
                      style={{ background: color.value }}
                    ></div>
                  )}
                  {color.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              size={'sm'}
              variant={'default'}
              onClick={() => onSave(nodeId, state)}
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
