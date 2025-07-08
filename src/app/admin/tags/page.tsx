"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Tag {
  id: string;
  name: string;
  url?: string | null;
  _count?: {
    exercises: number;
  };
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagUrl, setNewTagUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch tags
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTagName.trim(),
          url: newTagUrl.trim() || null,
        }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setTags((prev) => [...prev, newTag]);
        setNewTagName("");
        setNewTagUrl("");
        setSuccess("Պիտակը հաջողությամբ ստեղծվեց");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Սխալ պիտակ ստեղծելիս");
      }
    } catch (err) {
      setError("Սերվերի սխալ");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTag = async (tagId: string) => {
    if (!confirm("Դուք վստա՞հ եք, որ ցանկանում եք ջնջել այս պիտակը:")) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTags((prev) => prev.filter((tag) => tag.id !== tagId));
        setSuccess("Պիտակը հաջողությամբ ջնջվեց");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Սխալ պիտակ ջնջելիս");
      }
    } catch (err) {
      setError("Սերվերի սխալ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <Tag className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Վերադառնալ</span>
                </Link>
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Պիտակների կառավարում
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {error && (
          <Alert variant="destructive" className="mb-4 md:mb-6">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 md:mb-6">
            <AlertDescription className="text-sm">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create New Tag */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Նոր պիտակ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createTag} className="space-y-4">
                <div>
                  <Label htmlFor="tagName">Պիտակի անուն *</Label>
                  <Input
                    id="tagName"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Օրինակ՝ Մեխանիկա"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tagUrl">Հղում (ոչ պարտադիր)</Label>
                  <Input
                    id="tagUrl"
                    type="url"
                    value={newTagUrl}
                    onChange={(e) => setNewTagUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!newTagName.trim() || isCreating}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? "Ստեղծվում..." : "Ստեղծել պիտակ"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tags List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Գոյություն ունեցող պիտակներ ({tags.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tags.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Դեռ պիտակներ չկան
                </p>
              ) : (
                <div className="space-y-3">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Tag className="h-3 w-3" />
                          {tag.name}
                        </Badge>
                        {tag._count && (
                          <span className="text-sm text-gray-500">
                            {tag._count.exercises} վարժություն
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {tag.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={tag.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTag(tag.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
