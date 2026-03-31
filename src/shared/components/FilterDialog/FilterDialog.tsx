import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../utils";

type FilterSection = "status" | "projects" | "rms" | "ems";

interface Option {
  value: string;
  label: string;
}

interface UserOption {
  id: number;
  first_name: string;
  last_name: string;
}

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: {
    statusIds: string[];
    projectIds: string[];
    rmIds: string[];
    emIds: string[];
  }) => void;
  onReset: () => void;
  // Current applied values
  statusIds: string[];
  projectIds: string[];
  rmIds: string[];
  emIds: string[];
  // Options
  statusOptions: Option[];
  projectOptions: Option[];
  rmOptions: UserOption[];
  emOptions: UserOption[];
  // Visibility
  showRmFilter?: boolean;
  showEmFilter?: boolean;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
];

function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

export const FilterDialog = ({
  open,
  onClose,
  onApply,
  onReset,
  statusIds,
  projectIds,
  rmIds,
  emIds,
  statusOptions,
  projectOptions,
  rmOptions,
  emOptions,
  showRmFilter = true,
  showEmFilter = true,
}: FilterDialogProps) => {
  const [activeSection, setActiveSection] = useState<FilterSection>("status");
  const [localStatus, setLocalStatus] = useState<string[]>(statusIds);
  const [localProjects, setLocalProjects] = useState<string[]>(projectIds);
  const [localRms, setLocalRms] = useState<string[]>(rmIds);
  const [localEms, setLocalEms] = useState<string[]>(emIds);
  const [userSearch, setUserSearch] = useState("");

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalStatus(statusIds);
      setLocalProjects(projectIds);
      setLocalRms(rmIds);
      setLocalEms(emIds);
      setUserSearch("");
    }
  }, [open]);

  const sections: { key: FilterSection; label: string; show: boolean }[] = [
    { key: "status", label: "Status", show: true },
    { key: "projects", label: "Projects", show: true },
    { key: "rms", label: "RM's", show: showRmFilter },
    { key: "ems", label: "EM's", show: showEmFilter },
  ].filter((s) => s.show);

  const toggle = (
    value: string,
    current: string[],
    setter: (v: string[]) => void,
  ) => {
    setter(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );
  };

  const handleApply = () => {
    onApply({
      statusIds: localStatus,
      projectIds: localProjects,
      rmIds: localRms,
      emIds: localEms,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalStatus([]);
    setLocalProjects([]);
    setLocalRms([]);
    setLocalEms([]);
    onReset();
    onClose();
  };

  const filteredRms = rmOptions.filter((u) =>
    `${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  );

  const filteredEms = emOptions.filter((u) =>
    `${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  );

  const renderSelectedChips = (
    selected: string[],
    options: Option[],
    onRemove: (v: string) => void,
  ) => {
    if (selected.length === 0)
      return (
        <p className="text-sm text-muted-foreground italic">None selected</p>
      );
    return (
      <div className="flex flex-wrap gap-2">
        {selected.map((v) => {
          const label = options.find((o) => o.value === v)?.label ?? v;
          return (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground"
            >
              {label}
              <button onClick={() => onRemove(v)} className="hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  const renderSelectedUserChips = (
    selected: string[],
    users: UserOption[],
    onRemove: (v: string) => void,
  ) => {
    if (selected.length === 0)
      return (
        <p className="text-sm text-muted-foreground italic">None selected</p>
      );
    return (
      <div className="flex flex-wrap gap-2">
        {selected.map((v) => {
          const user = users.find((u) => String(u.id) === v);
          const label = user ? `${user.first_name} ${user.last_name}` : v;
          return (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground"
            >
              {label}
              <button onClick={() => onRemove(v)} className="hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 max-w-[50vw] w-[50vw] gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/40">
          <h2 className="text-lg font-bold text-foreground">Filter leads</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Filter by the following options
          </p>
        </div>

        {/* Body */}
        <div className="flex" style={{ height: "calc(75vh - 130px)" }}>
          {/* Left Sidebar */}
          <div className="w-36 border-r border-border/40 shrink-0">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => {
                  setActiveSection(section.key);
                  setUserSearch("");
                }}
                className={cn(
                  "w-full text-left px-4 py-4 text-sm font-medium border-b border-border/20 transition-colors",
                  activeSection === section.key
                    ? "bg-blue-50 dark:bg-blue-950/20 text-primary font-bold border-l-2 border-l-primary"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Status */}
            {activeSection === "status" && (
              <>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Selected
                  </p>
                  {renderSelectedChips(localStatus, statusOptions, (v) =>
                    setLocalStatus(localStatus.filter((s) => s !== v)),
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Select from
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions
                      .filter((o) => !localStatus.includes(o.value))
                      .map((o) => (
                        <button
                          key={o.value}
                          onClick={() =>
                            toggle(o.value, localStatus, setLocalStatus)
                          }
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 text-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          {o.label}
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Projects */}
            {activeSection === "projects" && (
              <>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Selected
                  </p>
                  {renderSelectedChips(localProjects, projectOptions, (v) =>
                    setLocalProjects(localProjects.filter((p) => p !== v)),
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Select from
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {projectOptions
                      .filter((o) => !localProjects.includes(o.value))
                      .map((o) => (
                        <button
                          key={o.value}
                          onClick={() =>
                            toggle(o.value, localProjects, setLocalProjects)
                          }
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 text-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          {o.label}
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* RM's */}
            {activeSection === "rms" && (
              <>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Selected
                  </p>
                  {renderSelectedUserChips(localRms, rmOptions, (v) =>
                    setLocalRms(localRms.filter((r) => r !== v)),
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Select from
                  </p>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search relationship managers....."
                      className="pl-9 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {filteredRms.map((u) => (
                      <button
                        key={u.id}
                        onClick={() =>
                          toggle(String(u.id), localRms, setLocalRms)
                        }
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                          localRms.includes(String(u.id))
                            ? "bg-muted/60"
                            : "hover:bg-muted/40",
                        )}
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold",
                            getAvatarColor(u.id),
                          )}
                        >
                          {getInitials(u.first_name, u.last_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {u.first_name} {u.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Senior Relationship Manager
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* EM's */}
            {activeSection === "ems" && (
              <>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Selected
                  </p>
                  {renderSelectedUserChips(localEms, emOptions, (v) =>
                    setLocalEms(localEms.filter((e) => e !== v)),
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Select from
                  </p>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search experience managers....."
                      className="pl-9 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1 max-h-52 overflow-y-auto">
                    {filteredEms.map((u) => (
                      <button
                        key={u.id}
                        onClick={() =>
                          toggle(String(u.id), localEms, setLocalEms)
                        }
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                          localEms.includes(String(u.id))
                            ? "bg-muted/60"
                            : "hover:bg-muted/40",
                        )}
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold",
                            getAvatarColor(u.id),
                          )}
                        >
                          {getInitials(u.first_name, u.last_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {u.first_name} {u.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Experience Manager
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/40">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply filter</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
