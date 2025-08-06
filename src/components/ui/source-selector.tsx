"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch("/api/sources");
      if (!response.ok) {
        throw new Error("Failed to fetch sources");
      }
      const data = await response.json();
      setSources(data);
    } catch (error) {
      setError("Failed to load sources");
      console.error("Error fetching sources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceToggle = (source: Source) => {
    const isSelected = selectedSources.some((s) => s.id === source.id);
    if (isSelected) {
      onSourcesChange(selectedSources.filter((s) => s.id !== source.id));
    } else {
      onSourcesChange([...selectedSources, source]);
    }
  };

  const handleAddSource = async () => {
    if (!newSourceName.trim()) {
      setError("Source name is required");
      return;
    }

    try {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSourceName.trim(),
          url: newSourceUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create source");
      }

      const newSource = await response.json();
      setSources([...sources, newSource]);
      onSourcesChange([...selectedSources, newSource]);
      setNewSourceName("");
      setNewSourceUrl("");
      setShowAddForm(false);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create source"
      );
    }
  };

  const filteredSources = sources.filter((source) =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading sources...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Selected Sources */}
      {selectedSources.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Selected Sources</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSources.map((source) => (
              <Badge
                key={source.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {source.name}
                <button
                  onClick={() => handleSourceToggle(source)}
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
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Add New Source Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New Source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="newSourceName" className="text-sm">
                Source Name *
              </Label>
              <Input
                id="newSourceName"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="e.g., Physics Textbook"
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="newSourceUrl" className="text-sm">
                URL (optional)
              </Label>
              <Input
                id="newSourceUrl"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="https://example.com"
                className="text-sm"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddSource}
                disabled={!newSourceName.trim()}
              >
                Add Source
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewSourceName("");
                  setNewSourceUrl("");
                  setError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Sources */}
      <div>
        <Label className="text-sm font-medium">Available Sources</Label>
        <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-2">
          {filteredSources.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No sources found
            </p>
          ) : (
            <div className="space-y-1">
              {filteredSources.map((source) => {
                const isSelected = selectedSources.some(
                  (s) => s.id === source.id
                );
                return (
                  <button
                    key={source.id}
                    onClick={() => handleSourceToggle(source)}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-100 text-blue-900 border border-blue-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">{source.name}</div>
                    {source.url && (
                      <div className="text-xs text-gray-500 truncate">
                        {source.url}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
