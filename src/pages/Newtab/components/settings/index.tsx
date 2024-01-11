import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { DashboardIcon } from '@radix-ui/react-icons';
import React from 'react';
import LocalStorage from './local-storage';
import Windows from './windows';

interface SettingsProps {
  toggleFullscreen: () => void;
}

const Settings = ({ toggleFullscreen }: SettingsProps) => {
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
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="text-sm"
            >
              Fullscreen
            </Button>
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium leading-none">Mode</h4>
              <ModeToggle />
            </div>
          </div>
          <Separator className="my-3" />
          <Windows />
          <Separator className="my-3" />
          <LocalStorage />
          <Separator className="my-3" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Settings;
