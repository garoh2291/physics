"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { useThemes, useSections } from "@/hooks/use-api";
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

interface ThemeSelectorProps {
  selectedThemes: Theme[];
  onThemesChange: (themes: Theme[]) => void;
  className?: string;
}

export function ThemeSelector({
  selectedThemes,
  onThemesChange,
  className,
}: ThemeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeUrl, setNewThemeUrl] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const { data: themes = [], isLoading: themesLoading } = useThemes();
  const { data: sections = [], isLoading: sectionsLoading } = useSections();
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

  const addTheme = (theme: Theme) => {
    if (!selectedThemes.find((t) => t.id === theme.id)) {
      onThemesChange([...selectedThemes, theme]);
    }
  };

  const removeTheme = (themeId: string) => {
    onThemesChange(selectedThemes.filter((t) => t.id !== themeId));
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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Group themes by section
  const themesBySection = sections.map((section) => ({
    ...section,
    themes: themes.filter((theme) => theme.section.id === section.id),
  }));

  const filteredSections = themesBySection.filter(
    (section) =>
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.themes.some((theme) =>
        theme.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (themesLoading || sectionsLoading) {
    return <div className="text-sm text-gray-500">Բեռնվում է...</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium">Թեմաներ</Label>
        <p className="text-sm text-gray-500 mt-1">
          Ընտրեք թեմաներ ըստ բաժինների կամ ստեղծեք նորերը
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
                  onClick={() => removeTheme(theme.id)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Որոնել թեմաներ կամ բաժիններ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleCreateTheme}
                disabled={
                  !newThemeName.trim() || !selectedSectionId || isCreating
                }
                className="flex-1"
              >
                {isCreating ? "Ստեղծվում է..." : "Ստեղծել"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewThemeName("");
                  setNewThemeUrl("");
                  setSelectedSectionId("");
                }}
                disabled={isCreating}
              >
                Չեղարկել
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Themes by Section */}
      {filteredSections.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Թեմաներ ըստ բաժինների</Label>
          {filteredSections.map((section) => (
            <Card key={section.id}>
              <CardHeader
                className="p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection(section.id)}
              >
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {section.name}
                    <Badge variant="outline" className="text-xs">
                      {section.themes.length}
                    </Badge>
                  </span>
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
              {expandedSections.has(section.id) && (
                <CardContent className="p-3 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {section.themes
                      .filter(
                        (theme) =>
                          !selectedThemes.find(
                            (selected) => selected.id === theme.id
                          )
                      )
                      .map((theme) => (
                        <Badge
                          key={theme.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => addTheme(theme)}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          {theme.name}
                        </Badge>
                      ))}
                    {section.themes.filter(
                      (theme) =>
                        !selectedThemes.find(
                          (selected) => selected.id === theme.id
                        )
                    ).length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        Բոլոր թեմաներն արդեն ընտրված են
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {sections.length === 0 && (
        <div className="text-center p-4 border rounded-lg">
          <p className="text-sm text-gray-500">
            Դեռ բաժիններ չկան: Սկսեք բաժին ստեղծելով:
          </p>
        </div>
      )}
    </div>
  );
}
