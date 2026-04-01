import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../../components/ui/sheet';

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const WIDTH_MAP = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
};

export const AppDrawer = ({ open, onClose, title, description, children, width = 'md' }: AppDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent className={`${WIDTH_MAP[width]} p-0 flex flex-col h-full overflow-hidden`}>
        <SheetHeader className="px-6 py-3.5 border-b shrink-0 space-y-0">
          <SheetTitle className="text-lg font-bold">{title}</SheetTitle>
          {description && <SheetDescription className="text-xs">{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
