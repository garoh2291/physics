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
import { useThemes } from "@/hooks/use-api";

interface Theme {
  id: string;
  name: string;
  url?: string | null;
  section: {
    id: string;
    name: string;
  };
}

interface Section {
  id: string;
  name: string;
  url?: string | null;
}

interface ThemeSelectorProps {
  selectedThemes: Theme[];
  onThemesChange: (themes: Theme[]) => void;
  selectedSections: Section[];
}

export function ThemeSelector({
  selectedThemes,
  onThemesChange,
  selectedSections,
}: ThemeSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const { data: themes = [], isLoading, refetch } = useThemes();

  // Filter themes based on search, selected sections, and exclude already selected ones
  const availableThemes = themes.filter((theme) => {
    const isNotSelected = !selectedThemes.some((t) => t.id === theme.id);
    const isInSelectedSections = selectedSections.some(
      (section) => section.id === theme.section.id
    );
    const matchesSearch = theme.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    return isNotSelected && isInSelectedSections && matchesSearch;
  });

  // Check if search value could be a new theme (only if we have selected sections)
  const canCreateNew =
    searchValue.trim() &&
    selectedSections.length > 0 &&
    !themes.some(
      (theme) => theme.name.toLowerCase() === searchValue.toLowerCase()
    );

  const handleSelect = (theme: Theme) => {
    onThemesChange([...selectedThemes, theme]);
    setSearchValue("");
  };

  const handleRemove = (e: React.MouseEvent, themeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onThemesChange(selectedThemes.filter((t) => t.id !== themeId));
  };

  const handleCreateNew = async () => {
    if (!searchValue.trim() || selectedSections.length === 0) return;

    // Use the first selected section for the new theme
    const sectionId = selectedSections[0].id;

    try {
      const response = await fetch("/api/themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: searchValue.trim(),
          sectionId: sectionId,
        }),
      });

      if (response.ok) {
        const newTheme = await response.json();
        onThemesChange([...selectedThemes, newTheme]);
        setSearchValue("");
        // Refetch themes to update the list
        refetch();
      }
    } catch (error) {
      console.error("Error creating theme:", error);
    }
  };

  const isDisabled = selectedSections.length === 0;

  return (
    <div className="space-y-4">
      {/* Selected Themes */}
      {selectedThemes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedThemes.map((theme) => (
            <Badge key={theme.id} variant="secondary" className="text-sm pr-1">
              {theme.name}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                onClick={(e) => handleRemove(e, theme.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Theme Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isDisabled}
          >
            {isDisabled ? "Նախ ընտրեք բաժիններ..." : "Ընտրեք թեմաներ..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Փնտրել թեմա..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                {isLoading
                  ? "Բեռնվում..."
                  : selectedSections.length === 0
                  ? "Ընտրեք բաժիններ՝ թեմաներ տեսնելու համար"
                  : "Թեմա չի գտնվել"}
              </CommandEmpty>

              {availableThemes.length > 0 && (
                <CommandGroup>
                  {availableThemes.map((theme) => (
                    <CommandItem
                      key={theme.id}
                      value={theme.name}
                      onSelect={() => handleSelect(theme)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                      <div>
                        <div className="font-medium">{theme.name}</div>
                        <div className="text-xs text-gray-500">
                          {theme.section.name}
                          {theme.url && (
                            <span className="ml-1 truncate">• {theme.url}</span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {canCreateNew && (
                <CommandGroup>
                  <CommandItem onSelect={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ստեղծել &quot;{searchValue}&quot; (
                    {selectedSections[0].name}-ում)
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
