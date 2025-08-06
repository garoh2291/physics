"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSections, useThemes } from "@/hooks/use-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, BookOpen, FolderOpen } from "lucide-react";

interface Section {
  id: string;
  name: string;
  url?: string | null;
  themes: Array<{ id: string; name: string; url?: string | null }>;
}

interface Theme {
  id: string;
  name: string;
  url?: string | null;
  section: {
    id: string;
    name: string;
  };
}

export default function SectionsPage() {
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionUrl, setNewSectionUrl] = useState("");
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeUrl, setNewThemeUrl] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const { data: sections = [], isLoading: sectionsLoading } = useSections();
  const { data: themes = [], isLoading: themesLoading } = useThemes();
  const queryClient = useQueryClient();

  const createSectionMutation = useMutation({
    mutationFn: async (data: { name: string; url?: string }) => {
      const response = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Բաժնի ստեղծման սխալ");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      setNewSectionName("");
      setNewSectionUrl("");
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; url?: string };
    }) => {
      const response = await fetch(`/api/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Բաժնի թարմացման սխալ");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      setEditingSection(null);
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sections/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Բաժնի ջնջման սխալ");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      setNewThemeName("");
      setNewThemeUrl("");
      setSelectedSectionId("");
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; url?: string; sectionId: string };
    }) => {
      const response = await fetch(`/api/themes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Թեմայի թարմացման սխալ");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      setEditingTheme(null);
    },
  });

  const deleteThemeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/themes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Թեմայի ջնջման սխալ");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });

  const handleCreateSection = () => {
    if (!newSectionName.trim()) return;
    createSectionMutation.mutate({
      name: newSectionName.trim(),
      url: newSectionUrl.trim() || undefined,
    });
  };

  const handleUpdateSection = () => {
    if (!editingSection || !newSectionName.trim()) return;
    updateSectionMutation.mutate({
      id: editingSection.id,
      data: {
        name: newSectionName.trim(),
        url: newSectionUrl.trim() || undefined,
      },
    });
  };

  const handleCreateTheme = () => {
    if (!newThemeName.trim() || !selectedSectionId) return;
    createThemeMutation.mutate({
      name: newThemeName.trim(),
      url: newThemeUrl.trim() || undefined,
      sectionId: selectedSectionId,
    });
  };

  const handleUpdateTheme = () => {
    if (!editingTheme || !newThemeName.trim() || !selectedSectionId) return;
    updateThemeMutation.mutate({
      id: editingTheme.id,
      data: {
        name: newThemeName.trim(),
        url: newThemeUrl.trim() || undefined,
        sectionId: selectedSectionId,
      },
    });
  };

  if (sectionsLoading || themesLoading) {
    return <div className="p-6">Բեռնվում է...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Բաժիններ և Թեմաներ</h1>
      </div>

      {/* Create Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Նոր Բաժին
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sectionName">Անվանում *</Label>
              <Input
                id="sectionName"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Օրինակ՝ Մեխանիկա"
              />
            </div>
            <div>
              <Label htmlFor="sectionUrl">URL</Label>
              <Input
                id="sectionUrl"
                value={newSectionUrl}
                onChange={(e) => setNewSectionUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <Button
            onClick={handleCreateSection}
            disabled={!newSectionName.trim() || createSectionMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            {createSectionMutation.isPending
              ? "Ստեղծվում է..."
              : "Ստեղծել Բաժին"}
          </Button>
        </CardContent>
      </Card>

      {/* Create Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Նոր Թեմա
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="themeName">Անվանում *</Label>
              <Input
                id="themeName"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="Օրինակ՝ Կինեմատիկա"
              />
            </div>
            <div>
              <Label htmlFor="themeUrl">URL</Label>
              <Input
                id="themeUrl"
                value={newThemeUrl}
                onChange={(e) => setNewThemeUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="themeSection">Բաժին *</Label>
              <select
                id="themeSection"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Ընտրեք բաժին</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            onClick={handleCreateTheme}
            disabled={
              !newThemeName.trim() ||
              !selectedSectionId ||
              createThemeMutation.isPending
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            {createThemeMutation.isPending ? "Ստեղծվում է..." : "Ստեղծել Թեմա"}
          </Button>
        </CardContent>
      </Card>

      {/* Sections and Themes List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Բաժիններ և Թեմաներ</h2>
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  {section.name}
                  <Badge variant="outline">{section.themes.length} թեմա</Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSection(section);
                          setNewSectionName(section.name);
                          setNewSectionUrl(section.url || "");
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Թարմացնել Բաժին</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Անվանում *</Label>
                          <Input
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>URL</Label>
                          <Input
                            value={newSectionUrl}
                            onChange={(e) => setNewSectionUrl(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleUpdateSection}
                            disabled={
                              !newSectionName.trim() ||
                              updateSectionMutation.isPending
                            }
                          >
                            {updateSectionMutation.isPending
                              ? "Թարմացվում է..."
                              : "Թարմացնել"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingSection(null)}
                          >
                            Չեղարկել
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(
                          "Դուք վստա՞հ եք, որ ցանկանում եք ջնջել այս բաժինը:"
                        )
                      ) {
                        deleteSectionMutation.mutate(section.id);
                      }
                    }}
                    disabled={deleteSectionMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {section.themes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.themes.map((theme) => (
                    <div
                      key={theme.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">{theme.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTheme(
                                  themes.find((t) => t.id === theme.id)!
                                );
                                setNewThemeName(theme.name);
                                setNewThemeUrl(theme.url || "");
                                setSelectedSectionId(section.id);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Թարմացնել Թեմա</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Անվանում *</Label>
                                <Input
                                  value={newThemeName}
                                  onChange={(e) =>
                                    setNewThemeName(e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <Label>URL</Label>
                                <Input
                                  value={newThemeUrl}
                                  onChange={(e) =>
                                    setNewThemeUrl(e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <Label>Բաժին *</Label>
                                <select
                                  value={selectedSectionId}
                                  onChange={(e) =>
                                    setSelectedSectionId(e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                  {sections.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleUpdateTheme}
                                  disabled={
                                    !newThemeName.trim() ||
                                    !selectedSectionId ||
                                    updateThemeMutation.isPending
                                  }
                                >
                                  {updateThemeMutation.isPending
                                    ? "Թարմացվում է..."
                                    : "Թարմացնել"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingTheme(null)}
                                >
                                  Չեղարկել
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                "Դուք վստա՞հ եք, որ ցանկանում եք ջնջել այս թեման:"
                              )
                            ) {
                              deleteThemeMutation.mutate(theme.id);
                            }
                          }}
                          disabled={deleteThemeMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Այս բաժնում դեռ թեմաներ չկան
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
