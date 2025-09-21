"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { UNITS } from "@/constants/units";

interface UnitSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function UnitSelector({
  value,
  onValueChange,
  placeholder = "Ընտրեք միավոր...",
  className,
}: UnitSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter units based on search
  const filteredUnits = UNITS.filter((unit) =>
    unit.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Check if search value could be a new unit
  const canCreateNew =
    searchValue.trim() &&
    !UNITS.some((unit) => unit.toLowerCase() === searchValue.toLowerCase());

  const handleSelect = (selectedUnit: string) => {
    onValueChange(selectedUnit);
    setOpen(false);
    setSearchValue("");
  };

  const handleCreateNew = () => {
    if (!searchValue.trim()) return;
    onValueChange(searchValue.trim());
    setOpen(false);
    setSearchValue("");
  };

  const displayValue = value || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {displayValue}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Փնտրել միավոր..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>Միավոր չի գտնվել</CommandEmpty>

            {filteredUnits.length > 0 && (
              <CommandGroup>
                {filteredUnits.map((unit) => (
                  <CommandItem
                    key={unit}
                    value={unit}
                    className="m-0"
                    onSelect={() => handleSelect(unit)}
                  >
                    {unit}
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === unit ? "opacity-100" : "opacity-0"
                      )}
                    />
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
  );
}
