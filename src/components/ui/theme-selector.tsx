"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, BookOpen, Search } from "lucide-react";
import { useThemes } from "@/hooks/use-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
}

interface ThemeSelectorProps {
  selectedThemes: Theme[];
  onThemesChange: (themes: Theme[]) => void;
  selectedSections?: Section[];
  className?: string;
}

export function ThemeSelector({
  selectedThemes,
  onThemesChange,
  selectedSections = [],
  className,
}: ThemeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeUrl, setNewThemeUrl] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: themes = [], isLoading: themesLoading } = useThemes();
  const queryClient = useQueryClient();

  const createThemeMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      url?: string;
      sectionId: string;
    }) => {
      const response = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Թեմայի ստեղծման սխալ");
      }
      return response.json();
    },
    onSuccess: (newTheme) => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      onThemesChange([...selectedThemes, newTheme]);
      setNewThemeName("");
      setNewThemeUrl("");
      setSelectedSectionId("");
      setShowCreateForm(false);
      setIsCreating(false);
    },
    onError: (error: Error) => {
      console.error("Error creating theme:", error);
      setIsCreating(false);
    },
  });

  // Filter themes based on selected sections - if no sections selected, show no themes
  const availableThemes = selectedSections.length === 0 
    ? [] 
    : themes.filter((theme) => 
        selectedSections.some((section) => section.id === theme.section.id)
      );

  const filteredThemes = availableThemes.filter(
    (theme) =>
      !selectedThemes.some((selected) => selected.id === theme.id) &&
      theme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTheme = (theme: Theme) => {
    if (!selectedThemes.some((selected) => selected.id === theme.id)) {
      onThemesChange([...selectedThemes, theme]);
    }
    setSearchTerm("");
  };

  const handleRemoveTheme = (themeId: string) => {
    onThemesChange(
      selectedThemes.filter((theme) => theme.id !== themeId)
    );
  };

  const handleCreateTheme = async () => {
    if (!newThemeName.trim() || !selectedSectionId) return;

    setIsCreating(true);
    createThemeMutation.mutate({
      name: newThemeName.trim(),
      url: newThemeUrl.trim() || undefined,
      sectionId: selectedSectionId,
    });
  };

  if (themesLoading) {
    return <div className="text-sm text-gray-500">Բեռնվում է...</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium">Թեմաներ</Label>
        <p className="text-sm text-gray-500 mt-1">
          {selectedSections.length === 0 
            ? "Նախ ընտրեք բաժին, որպեսզի կարողանաք ընտրել թեմաներ"
            : "Ընտրեք թեմաներ ընտրված բաժիններից"
          }
        </p>
      </div>

      {/* Selected Themes */}
      {selectedThemes.length > 0 && (
        <div>
          <Label className="text-sm font-medium">
            Ընտրված թեմաներ ({selectedThemes.length})
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedThemes.map((theme) => (
              <Badge
                key={theme.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <BookOpen className="h-3 w-3" />
                {theme.name}
                <span className="text-xs text-gray-500">
                  ({theme.section.name})
                </span>
                <button
                  onClick={() => handleRemoveTheme(theme.id)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search and Add */}
      {selectedSections.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Որոնել թեմաներ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {searchTerm && filteredThemes.length > 0 && (
            <div className="border rounded-lg max-h-40 overflow-y-auto">
              {filteredThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleAddTheme(theme)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 text-sm flex items-center justify-between"
                >
                  <span>{theme.name}</span>
                  <span className="text-xs text-gray-500">
                    {theme.section.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {searchTerm && filteredThemes.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-2">
              Թեմա չի գտնվել
            </div>
          )}

          {/* Create New Theme */}
          {!showCreateForm ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ավելացնել նոր թեմա
            </Button>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label htmlFor="newThemeName" className="text-sm">
                    Թեմայի անվանում *
                  </Label>
                  <Input
                    id="newThemeName"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    placeholder="Օրինակ՝ Կինեմատիկա"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="newThemeUrl" className="text-sm">
                    URL (ոչ պարտադիր)
                  </Label>
                  <Input
                    id="newThemeUrl"
                    value={newThemeUrl}
                    onChange={(e) => setNewThemeUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sectionSelect" className="text-sm">
                    Բաժին *
                  </Label>
                  <select
                    id="sectionSelect"
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Ընտրեք բաժին</option>
                    {selectedSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={handleCreateTheme}
                    disabled={
                      !newThemeName.trim() || !selectedSectionId || isCreating
                    }
                    size="sm"
                  >
                    {isCreating ? "Ստեղծվում է..." : "Ստեղծել"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewThemeName("");
                      setNewThemeUrl("");
                      setSelectedSectionId("");
                    }}
                    size="sm"
                  >
                    Չեղարկել
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}