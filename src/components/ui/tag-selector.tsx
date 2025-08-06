"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Tag, Search } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  url?: string | null;
}

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  className?: string;
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  className,
}: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (response.ok) {
          const tags = await response.json();
          setAvailableTags(tags);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, []);

  const addTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAvailableTags((prev) => [...prev, newTag]);
        addTag(newTag);
        setNewTagName("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Սխալ պիտակ ստեղծելիս");
      }
    } catch {
      setError("Սերվերի սխալ");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      createNewTag();
    }
  };

  const unselectedTags = availableTags.filter(
    (tag) => 
      !selectedTags.find((selected) => selected.id === tag.id) &&
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium">Պիտակներ</Label>
        <p className="text-sm text-gray-500 mt-1">
          Ընտրեք գոյություն ունեցող պիտակներ կամ ստեղծեք նորերը
        </p>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              <Tag className="h-3 w-3" />
              {tag.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeTag(tag.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Create New Tag */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Նոր պիտակի անուն..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isCreating}
              />
            </div>
            <Button
              onClick={createNewTag}
              disabled={!newTagName.trim() || isCreating}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              {isCreating ? "Ստեղծվում..." : "Ավելացնել"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Available Tags */}
      {unselectedTags.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Գոյություն ունեցող պիտակներ
          </Label>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Որոնել պիտակներ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {unselectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-50 px-3 py-1"
                  onClick={() => addTag(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
              {searchTerm && unselectedTags.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2 w-full">
                  Պիտակ չի գտնվել
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {availableTags.length === 0 && selectedTags.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Դեռ պիտակներ չկան: Ստեղծեք առաջին պիտակը:
        </p>
      )}
    </div>
  );
}
