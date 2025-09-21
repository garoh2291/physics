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
import { useTags } from "@/hooks/use-api";

interface Tag {
  id: string;
  name: string;
  url?: string | null;
}

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const { data: tags = [], isLoading, refetch } = useTags();

  // Filter tags based on search and exclude already selected ones
  const availableTags = tags.filter((tag) => {
    const isNotSelected = !selectedTags.some((t) => t.id === tag.id);
    const matchesSearch = tag.name
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    return isNotSelected && matchesSearch;
  });

  // Check if search value could be a new tag
  const canCreateNew =
    searchValue.trim() &&
    !tags.some((tag) => tag.name.toLowerCase() === searchValue.toLowerCase());

  const handleSelect = (tag: Tag) => {
    onTagsChange([...selectedTags, tag]);
    setSearchValue("");
  };

  const handleRemove = (e: React.MouseEvent, tagId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Removing tag with id:", tagId);
    onTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateNew = async () => {
    if (!searchValue.trim()) return;

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: searchValue.trim(),
        }),
      });

      if (response.ok) {
        const newTag = await response.json();
        onTagsChange([...selectedTags, newTag]);
        setSearchValue("");
        // Refetch tags to update the list
        refetch();
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-sm pr-1">
              {tag.name}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                onClick={(e) => handleRemove(e, tag.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Ընտրեք պիտակներ...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Փնտրել պիտակ..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                {isLoading ? "Բեռնվում..." : "Պիտակ չի գտնվել"}
              </CommandEmpty>

              {availableTags.length > 0 && (
                <CommandGroup>
                  {availableTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelect(tag)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                      <div>
                        <div className="font-medium">{tag.name}</div>
                        {tag.url && (
                          <div className="text-xs text-gray-500 truncate">
                            {tag.url}
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
