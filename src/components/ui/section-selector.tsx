"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search } from "lucide-react";
import { useSections } from "@/hooks/use-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionUrl, setNewSectionUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: sections = [], isLoading, error } = useSections();
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
    onSuccess: (newSection) => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      onSectionsChange([...selectedSections, newSection]);
      setNewSectionName("");
      setNewSectionUrl("");
      setShowCreateForm(false);
      setIsCreating(false);
    },
    onError: (error: Error) => {
      console.error("Error creating section:", error);
      setIsCreating(false);
    },
  });

  const filteredSections = sections.filter(
    (section) =>
      !selectedSections.some((selected) => selected.id === section.id) &&
      section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSection = (section: Section) => {
    if (!selectedSections.some((selected) => selected.id === section.id)) {
      onSectionsChange([...selectedSections, section]);
    }
    setSearchTerm("");
  };

  const handleRemoveSection = (sectionId: string) => {
    onSectionsChange(
      selectedSections.filter((section) => section.id !== sectionId)
    );
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) return;

    setIsCreating(true);
    createSectionMutation.mutate({
      name: newSectionName.trim(),
      url: newSectionUrl.trim() || undefined,
    });
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Բեռնվում է...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Սխալ՝ {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Selected Sections */}
      {selectedSections.length > 0 && (
        <div>
          <Label className="text-sm font-medium">
            Ընտրված բաժիններ ({selectedSections.length})
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSections.map((section) => (
              <Badge
                key={section.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {section.name}
                <button
                  onClick={() => handleRemoveSection(section.id)}
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
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Որոնել բաժիններ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {searchTerm && filteredSections.length > 0 && (
          <div className="border rounded-lg max-h-40 overflow-y-auto">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleAddSection(section)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 text-sm"
              >
                {section.name}
              </button>
            ))}
          </div>
        )}

        {/* Create New Section */}
        {!showCreateForm ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ավելացնել նոր բաժին
          </Button>
        ) : (
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <Label htmlFor="newSectionName" className="text-sm">
                Բաժնի անվանում *
              </Label>
              <Input
                id="newSectionName"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Օրինակ՝ Մեխանիկա"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newSectionUrl" className="text-sm">
                URL (ոչ պարտադիր)
              </Label>
              <Input
                id="newSectionUrl"
                value={newSectionUrl}
                onChange={(e) => setNewSectionUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleCreateSection}
                disabled={!newSectionName.trim() || isCreating}
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
                  setNewSectionName("");
                  setNewSectionUrl("");
                }}
                disabled={isCreating}
              >
                Չեղարկել
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Հուշում:</strong> Ընտրեք բաժիններ կամ ստեղծեք նորերը
          վարժությունները կազմակերպելու համար:
        </p>
      </div>
    </div>
  );
}
