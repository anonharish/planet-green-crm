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
  showHeader?: boolean;
}

const WIDTH_MAP = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
};

export const AppDrawer = ({ open, onClose, title, description, children, width = 'md', showHeader = true }: AppDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent className={`${WIDTH_MAP[width]} p-0 flex flex-col h-full overflow-hidden border-none shadow-2xl`}>
        {showHeader && (
          <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0 space-y-1 text-left">
            <SheetTitle
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: '24px',
                lineHeight: '32px',
                letterSpacing: '-0.6px',
                color: '#191C1E',
              }}
            >
              {title}
            </SheetTitle>
            {description && (
              <SheetDescription
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '22.75px',
                  letterSpacing: '0px',
                  color: '#64748B',
                }}
              >
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
