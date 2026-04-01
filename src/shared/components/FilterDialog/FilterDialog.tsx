import React, { useState, useEffect } from "react";
import { X, Search, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../utils";
import { useGetReporteesQuery } from "../../../features/users/api/usersApi";

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
  showRmFilter = true,
  showEmFilter = true,
}: FilterDialogProps) => {
  const [activeSection, setActiveSection] = useState<FilterSection>("status");
  const [localStatus, setLocalStatus] = useState<string[]>(statusIds);
  const [localProjects, setLocalProjects] = useState<string[]>(projectIds);
  const [localRmId, setLocalRmId] = useState<string>(rmIds[0] || "");
  const [localEmIds, setLocalEmIds] = useState<string[]>(emIds);
  const [userSearch, setUserSearch] = useState("");

  const { data: liveEms = [], isFetching: isFetchingEms } = useGetReporteesQuery(
    { reporting_manager_id: Number(localRmId), offset: 0 },
    { skip: !localRmId },
  );

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalStatus(statusIds);
      setLocalProjects(projectIds);
      setLocalRmId(rmIds[0] || "");
      setLocalEmIds(emIds);
      setUserSearch("");
      setActiveSection("status");
    }
  }, [open]);

  const sections: { key: FilterSection; label: string; show: boolean }[] = [
    { key: "status" as FilterSection, label: "Status", show: true },
    { key: "projects" as FilterSection, label: "Projects", show: true },
    { key: "rms" as FilterSection, label: "RM's", show: showRmFilter },
    { key: "ems" as FilterSection, label: "EM's", show: showEmFilter },
  ].filter((s) => s.show);

  const toggleMulti = (
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

  const handleSelectRm = (id: string) => {
    if (localRmId === id) {
      setLocalRmId("");
      setLocalEmIds([]);
    } else {
      setLocalRmId(id);
      setLocalEmIds([]);
    }
  };

  const handleApply = () => {
    onApply({
      statusIds: localStatus,
      projectIds: localProjects,
      rmIds: localRmId ? [localRmId] : [],
      emIds: localEmIds,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalStatus([]);
    setLocalProjects([]);
    setLocalRmId("");
    setLocalEmIds([]);
    onReset();
    onClose();
  };

  const filteredRms = rmOptions.filter((u) =>
    `${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  );

  const filteredEms = liveEms.filter((u) =>
    `${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  );

  const renderChips = (
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"
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

  const renderUserRow = (
    u: UserOption,
    isSelected: boolean,
    onClick: () => void,
    role: string,
  ) => (
    <button
      key={u.id}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
        isSelected
          ? "bg-primary/8 dark:bg-primary/10"
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
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
      {/* Jira-style check indicator */}
      <div
        className={cn(
          "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
          isSelected
            ? "border-primary bg-primary"
            : "border-border/60",
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 max-w-[50vw] w-[50vw] gap-0 overflow-hidden rounded-2xl border-border-2">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border-2">
          <h2 className="text-lg font-bold text-foreground">Filter leads</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Filter by the following options
          </p>
        </div>

        {/* Body */}
        <div className="flex" style={{ height: "calc(75vh - 130px)" }}>
          {/* Left Sidebar */}
          <div className="w-36 border-r border-border-2 shrink-0">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => {
                  setActiveSection(section.key);
                  setUserSearch("");
                }}
                className={cn(
                  "w-full text-left px-4 py-4 text-sm font-medium border-b border-border-2 transition-colors",
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
            {activeSection === "status" && (
              <>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Selected
                  </p>
                  {renderChips(localStatus, statusOptions, (v) =>
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
                            toggleMulti(o.value, localStatus, setLocalStatus)
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border-2 text-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          {o.label}
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Projects ── */}
            {activeSection === "projects" && (
              <>
                <div>
                  <p className="text-sm font-bold text-foreground mb-3">
                    Selected
                  </p>
                  {renderChips(localProjects, projectOptions, (v) =>
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
                            toggleMulti(o.value, localProjects, setLocalProjects)
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border-2 text-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          {o.label}
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* ── RM's (single-select, Jira-style) ── */}
            {activeSection === "rms" && (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search relationship managers....."
                    className="pl-9 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  {filteredRms.map((u) =>
                    renderUserRow(
                      u,
                      localRmId === String(u.id),
                      () => handleSelectRm(String(u.id)),
                      "Relationship Manager",
                    ),
                  )}
                </div>
              </>
            )}

            {/* EM's */}
            {activeSection === "ems" && (
              <>
                {!localRmId ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                    <p className="text-sm font-medium">Select an RM first</p>
                    <p className="text-xs">Go to the RM's tab to pick a Relationship Manager.</p>
                  </div>
                ) : (
                  <>
                    {/* Selected chips */}
                    <div>
                      <p className="text-sm font-bold text-foreground mb-3">Selected</p>
                      {localEmIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">None selected</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {localEmIds.map((v) => {
                            const user = filteredEms.find((u) => String(u.id) === v) ||
                              liveEms.find((u) => String(u.id) === v);
                            const label = user ? `${user.first_name} ${user.last_name}` : v;
                            return (
                              <span
                                key={v}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"
                              >
                                {label}
                                <button
                                  onClick={() => setLocalEmIds(localEmIds.filter((e) => e !== v))}
                                  className="hover:opacity-70"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Select from */}
                    <div>
                      <p className="text-sm font-bold text-foreground mb-3">Select from</p>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search experience managers....."
                          className="pl-9 rounded-lg"
                        />
                      </div>

                      {isFetchingEms ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredEms.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          No experience managers found.
                        </p>
                      ) : (
                        <div className="space-y-1 max-h-52 overflow-y-auto">
                          {filteredEms
                            .filter((u) => !localEmIds.includes(String(u.id)))
                            .map((u) =>
                              renderUserRow(
                                u,
                                false,
                                () => toggleMulti(String(u.id), localEmIds, setLocalEmIds),
                                "Experience Manager",
                              ),
                            )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Clear filters
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply filter</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
