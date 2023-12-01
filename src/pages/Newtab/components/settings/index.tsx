import React from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { DashboardIcon } from '@radix-ui/react-icons';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ModeToggle } from '@/components/mode-toggle';
import LocalStorage from './local-storage';

const Settings = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="absolute bottom-2 right-2 bg-transparent border-none text-white text-2xl z-10 h-10 w-10 rounded-full opacity-75"
          variant="outline"
          size="icon"
        >
          <DashboardIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-medium leading-none">Mode</h4>
            <ModeToggle />
          </div>
          <Separator className="my-3" />
          <LocalStorage />
          <Separator className="my-3" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Settings;
