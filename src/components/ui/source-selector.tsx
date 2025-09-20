"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useSources } from "@/hooks/use-api";

interface Source {
  id: string;
  name: string;
  url?: string | null;
}

interface SourceSelectorProps {
  selectedSources: Source[];
  onSourcesChange: (sources: Source[]) => void;
}

export function SourceSelector({
  selectedSources,
  onSourcesChange,
}: SourceSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const { data: sources = [], isLoading, refetch } = useSources();

  // Filter sources based on search and exclude already selected ones
  const availableSources = sources.filter((source) => {
    const isNotSelected = !selectedSources.some((s) => s.id === source.id);
    const matchesSearch = source.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    return isNotSelected && matchesSearch;
  });

  // Check if search value could be a new source
  const canCreateNew =
    searchValue.trim() &&
    !sources.some(
      (source) => source.name.toLowerCase() === searchValue.toLowerCase()
    );

  const handleSelect = (source: Source) => {
    onSourcesChange([...selectedSources, source]);
    setOpen(false);
    setSearchValue("");
  };

  const handleRemove = (sourceId: string) => {
    onSourcesChange(selectedSources.filter((s) => s.id !== sourceId));
  };

  const handleCreateNew = async () => {
    if (!searchValue.trim()) return;

    try {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: searchValue.trim(),
        }),
      });

      if (response.ok) {
        const newSource = await response.json();
        onSourcesChange([...selectedSources, newSource]);
        setOpen(false);
        setSearchValue("");
        // Refetch sources to update the list
        refetch();
      }
    } catch (error) {
      console.error("Error creating source:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Sources */}
      {selectedSources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSources.map((source) => (
            <Badge key={source.id} variant="secondary" className="text-sm">
              {source.name}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={() => handleRemove(source.id)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Source Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Ընտրեք աղբյուրներ...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Փնտրել աղբյուր..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                {isLoading ? "Բեռնվում..." : "Աղբյուր չի գտնվել"}
              </CommandEmpty>

              {availableSources.length > 0 && (
                <CommandGroup>
                  {availableSources.map((source) => (
                    <CommandItem
                      key={source.id}
                      value={source.name}
                      onSelect={() => handleSelect(source)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                      <div>
                        <div className="font-medium">{source.name}</div>
                        {source.url && (
                          <div className="text-xs text-gray-500 truncate">
                            {source.url}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {canCreateNew && (
                <CommandGroup>
                  <CommandItem onSelect={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ստեղծել &quot;{searchValue}&quot;
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
