import React from 'react';
import { UserCircle2, User, Trash2, X, Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../../../components/ui/command';
import { Separator } from '../../../components/ui/separator';
import { cn } from '../../../utils';

interface BulkActionsBarProps {
  selectedCount: number;
  rms: any[];
  ems: any[];
  onAssignRm: (rmId: number) => void;
  onAssignEm: (emId: number) => void;
  onMarkAsJunk: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const InitialsAvatar = ({ name }: { name: string }) => {
  const parts = name.split(' ');
  const initials = `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
  return (
    <div className="h-6 w-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0 uppercase">
      {initials}
    </div>
  );
};

export const BulkActionsBar = ({
  selectedCount,
  rms,
  ems,
  onAssignRm,
  onAssignEm,
  onMarkAsJunk,
  onCancel,
  isLoading
}: BulkActionsBarProps) => {
  const [rmOpen, setRmOpen] = React.useState(false);
  const [emOpen, setEmOpen] = React.useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-full border border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center gap-6 min-w-max">
        {/* Count Badge */}
        <div className="flex items-center gap-3 pr-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white shadow-sm shadow-primary/20">
            {selectedCount}
          </div>
          <span className="text-sm font-bold text-primary whitespace-nowrap">
            Leads Selected
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Assign RM */}
          <Popover open={rmOpen} onOpenChange={setRmOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4 text-xs font-bold border-primary/20 text-primary hover:bg-primary/5 transition-all gap-2"
              >
                <UserCircle2 className="h-4 w-4" />
                Assign RM
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="center" side="top" sideOffset={16}>
              <Command>
                <CommandInput placeholder="Search RM..." className="h-9 text-xs" />
                <CommandEmpty className="py-3 text-xs text-center text-zinc-400">No RM found</CommandEmpty>
                <CommandGroup className="max-h-48 overflow-y-auto">
                  {rms.map((m) => (
                    <CommandItem
                      key={m.id}
                      onSelect={() => {
                        onAssignRm(m.id);
                        setRmOpen(false);
                      }}
                      className="flex items-center gap-2 py-2 cursor-pointer"
                    >
                      <InitialsAvatar name={`${m.first_name} ${m.last_name}`} />
                      <span className="text-xs font-medium">{m.first_name} {m.last_name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Assign EM */}
          {/* <Popover open={emOpen} onOpenChange={setEmOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4 text-xs font-bold border-primary/20 text-primary hover:bg-primary/5 transition-all gap-2"
              >
                <User className="h-4 w-4" />
                Assign EM
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="center" side="top" sideOffset={16}>
              <Command>
                <CommandInput placeholder="Search EM..." className="h-9 text-xs" />
                <CommandEmpty className="py-3 text-xs text-center text-zinc-400">No EM found</CommandEmpty>
                <CommandGroup className="max-h-48 overflow-y-auto">
                  {ems.map((e) => (
                    <CommandItem
                      key={e.id}
                      onSelect={() => {
                        onAssignEm(e.id);
                        setEmOpen(false);
                      }}
                      className="flex items-center gap-2 py-2 cursor-pointer"
                    >
                      <InitialsAvatar name={`${e.first_name} ${e.last_name}`} />
                      <span className="text-xs font-medium">{e.first_name} {e.last_name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover> */}
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Secondary Actions */}
        <div className="flex items-center gap-3">
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAsJunk}
            disabled={isLoading}
            className="h-10 rounded-xl px-5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Mark as Junk
          </Button> */}

          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
