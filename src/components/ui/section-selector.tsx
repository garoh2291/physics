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
import { useSections } from "@/hooks/use-api";

interface Section {
  id: string;
  name: string;
  url?: string | null;
}

interface SectionSelectorProps {
  selectedSections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

export function SectionSelector({
  selectedSections,
  onSectionsChange,
}: SectionSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const { data: sections = [], isLoading, refetch } = useSections();

  // Filter sections based on search and exclude already selected ones
  const availableSections = sections.filter((section) => {
    const isNotSelected = !selectedSections.some((s) => s.id === section.id);
    const matchesSearch = section.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    return isNotSelected && matchesSearch;
  });

  // Check if search value could be a new section
  const canCreateNew =
    searchValue.trim() &&
    !sections.some(
      (section) => section.name.toLowerCase() === searchValue.toLowerCase()
    );

  const handleSelect = (section: Section) => {
    onSectionsChange([...selectedSections, section]);
    setSearchValue("");
  };

  const handleRemove = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onSectionsChange(selectedSections.filter((s) => s.id !== sectionId));
  };

  const handleCreateNew = async () => {
    if (!searchValue.trim()) return;

    try {
      const response = await fetch("/api/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: searchValue.trim(),
        }),
      });

      if (response.ok) {
        const newSection = await response.json();
        onSectionsChange([...selectedSections, newSection]);
        setSearchValue("");
        // Refetch sections to update the list
        refetch();
      }
    } catch (error) {
      console.error("Error creating section:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Sections */}
      {selectedSections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSections.map((section) => (
            <Badge
              key={section.id}
              variant="secondary"
              className="text-sm pr-1"
            >
              {section.name}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                onClick={(e) => handleRemove(e, section.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Section Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Ընտրեք բաժիններ...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Փնտրել բաժին..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                {isLoading ? "Բեռնվում..." : "Բաժին չի գտնվել"}
              </CommandEmpty>

              {availableSections.length > 0 && (
                <CommandGroup>
                  {availableSections.map((section) => (
                    <CommandItem
                      key={section.id}
                      value={section.name}
                      onSelect={() => handleSelect(section)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                      <div>
                        <div className="font-medium">{section.name}</div>
                        {section.url && (
                          <div className="text-xs text-gray-500 truncate">
                            {section.url}
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
