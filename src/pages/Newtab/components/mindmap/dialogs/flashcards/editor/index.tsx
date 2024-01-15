import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Editor } from 'novel';
import React, { useEffect } from 'react';
import './index.scss';

interface DataProps {
  front: any;
  back: any;
}

interface FlashcardEditorDialogProps {
  data?: DataProps;
  onSave: (data: DataProps) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function FlashcardEditorDialog({
  data,
  onSave,
  onDelete,
  onClose,
}: FlashcardEditorDialogProps) {
  const [state, setState] = React.useState<DataProps>({
    front: '',
    back: '',
  });
  const [open, setOpen] = React.useState(true);

  useEffect(() => {
    if (!open) {
      onClose();
    }
  }, [open]);

  useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit flashcard</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Editor
            defaultValue={state.front || ''}
            onDebouncedUpdate={(editor) => {
              setState((prev: any) => ({ ...prev, front: editor?.getJSON() }));
            }}
            debounceDuration={750}
            disableLocalStorage={true}
            className="front-editor relative min-h-[100px] mb-5 w-full max-w-screen-lg bg-background"
          />
          <Separator />
          <Editor
            defaultValue={state.back || ''}
            onDebouncedUpdate={(editor) => {
              setState((prev: any) => ({ ...prev, back: editor?.getJSON() }));
            }}
            debounceDuration={750}
            disableLocalStorage={true}
            className="back-editor relative min-h-[100px] mb-5 w-full max-w-screen-lg bg-background"
          />
        </div>
        <DialogFooter>
          {!!data && (
            <Button size={'sm'} variant={'destructive'} onClick={onDelete}>
              Delete
            </Button>
          )}
          <DialogClose asChild>
            <Button
              size={'sm'}
              variant={'default'}
              disabled={!state.front || !state.back}
              onClick={() => onSave(state)}
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
