"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { MathEditor } from "@/components/math-editor";
import { FileUpload } from "@/components/ui/file-upload";
import { FileViewer } from "@/components/ui/file-viewer";
import { useExercise, useUpdateExercise } from "@/hooks/use-api";

// Simple Markdown to HTML converter for preview
function markdownToPreviewHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(
    /^### (.*$)/gm,
    '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gm,
    '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gm,
    '<h1 class="text-2xl font-bold mb-4 mt-8">$1</h1>'
  );

  // Text formatting
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-purple-700">$1</strong>'
  );
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Math formulas (inline code blocks)
  html = html.replace(
    /`([^`]+)`/g,
    '<span class="math-formula bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm border border-blue-200">$1</span>'
  );

  // Units (underscored text)
  html = html.replace(
    /_([\w\/\²\³\¹\°]+)_/g,
    '<span class="math-unit bg-green-100 text-green-700 px-1 py-0.5 rounded text-sm border border-green-200">$1</span>'
  );

  // Lists
  html = html.replace(/^- (.+$)/gm, '<li class="ml-4 mb-1">• $1</li>');
  html = html.replace(/^(\d+)\. (.+$)/gm, '<li class="ml-4 mb-1">$1. $2</li>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = html.replace(/\n/g, "<br>");

  // Wrap in paragraphs
  if (html && !html.startsWith("<h") && !html.startsWith("<li")) {
    html = '<p class="mb-4">' + html + "</p>";
  }

  return html;
}

export default function EditExercisePage() {
  const params = useParams();
  const exerciseId = params.id as string;

  const [title, setTitle] = useState("");
  const [problemText, setProblemText] = useState("");
  const [problemImage, setProblemImage] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [solutionSteps, setSolutionSteps] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const {
    data: exercise,
    isLoading,
    error: fetchError,
  } = useExercise(exerciseId);
  const updateExerciseMutation = useUpdateExercise();

  // Load exercise data when it's fetched
  useEffect(() => {
    if (exercise) {
      setTitle(exercise.title);
      setProblemText(exercise.problemText || "");
      setProblemImage(exercise.problemImage || "");
      // Load answer data if it exists
      if (exercise.exerciseAnswer) {
        setCorrectAnswer(exercise.exerciseAnswer.correctAnswer || "");
        setSolutionSteps(exercise.exerciseAnswer.solutionSteps || "");
      }
    }
  }, [exercise]);

  const saveAnswerData = async (exerciseId: string) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctAnswer,
          solutionSteps,
        }),
      });

      if (response.ok) {
        router.push(`/admin/exercises/${exerciseId}`);
      } else {
        setError("Պատասխանի պահպանման սխալ");
      }
    } catch (error) {
      console.error("Error saving answer data:", error);
      setError("Պատասխանի պահպանման սխալ");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || (!problemText.trim() && !problemImage)) {
      setError("Վերնագիրը և խնդիրը (տեքստ կամ նկար) պարտադիր են");
      return;
    }

    updateExerciseMutation.mutate(
      {
        id: exerciseId,
        data: { title, problemText, problemImage },
      },
      {
        onSuccess: (exercise) => {
          // If we have answer data, save it separately
          if (correctAnswer || solutionSteps) {
            saveAnswerData(exercise.id);
          } else {
            router.push(`/admin/exercises/${exercise.id}`);
          }
        },
        onError: (error: Error) => {
          setError(error.message);
        },
      }
    );
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Բեռնվում...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Սխալ՝ {fetchError.message}</div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Վարժությունը չգտնվեց</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/exercises/${exerciseId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Վերադառնալ
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Խմբագրել վարժություն
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={togglePreview} type="button">
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? "Խմբագրել" : "Նախադիտել"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateExerciseMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateExerciseMutation.isPending ? "Պահպանվում..." : "Պահպանել"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPreview ? (
          /* Preview Mode */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📖</span>
                Նախադիտում (Markdown)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  {title || "Վարժության վերնագիր"}
                </h2>
                {problemImage ? (
                  <FileViewer
                    url={problemImage}
                    title="Խնդիրի նկար"
                    className="mb-4"
                  />
                ) : (
                  <div
                    className="prose prose-lg max-w-none bg-white p-6 rounded-lg border"
                    dangerouslySetInnerHTML={{
                      __html:
                        markdownToPreviewHtml(problemText) ||
                        '<p class="text-gray-500 italic">Խնդիրի նկարագրություն...</p>',
                    }}
                  />
                )}
                {problemText && problemImage && (
                  <div
                    className="prose prose-lg max-w-none bg-white p-6 rounded-lg border mt-4"
                    dangerouslySetInnerHTML={{
                      __html: markdownToPreviewHtml(problemText),
                    }}
                  />
                )}
              </div>

              {solutionSteps && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <span>🔧</span>
                    Լուծման քայլեր
                  </h3>
                  <div
                    className="prose prose-lg max-w-none bg-blue-50 p-6 rounded-lg border border-blue-200"
                    dangerouslySetInnerHTML={{
                      __html: markdownToPreviewHtml(solutionSteps),
                    }}
                  />
                </div>
              )}

              {correctAnswer && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <span>✅</span>
                    Ճիշտ պատասխան
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <span className="font-mono text-green-800 text-lg">
                      {correctAnswer}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-medium mb-2">💾 Markdown պահպանում</h4>
                <p className="text-sm text-gray-600">
                  Վարժությունը կպահպանվի Markdown ֆորմատով և կկարողանա ճիշտ
                  ցուցադրել մաթեմատիկական բովանդակությունը:
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Հիմնական տվյալներ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="title">Վարժության վերնագիր *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Օրինակ՝ Կարմիր Գլխարկը և գայլը"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Problem Text */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📝</span>
                  Խնդիրի նկարագրություն *
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Կարող եք տեղադրել մաթեմատիկական տեքստ կամ վերբեռնել նկար
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="problemText">
                    Խնդիրի տեքստ (ոչ պարտադիր)
                  </Label>
                  <MathEditor
                    value={problemText}
                    onChange={setProblemText}
                    height={350}
                    placeholder="Մուտքագրեք խնդիրի նկարագրությունը... 

Օրինակ՝
Կարմիր Գլխարկը պատրաստել էր **N₀ = 20** հատ կարկանդակ...
Արագությունը `v = 5` _մ/վ_ էր...

Կարող եք օգտագործել մաթեմատիկական նշաններ և բանաձևեր։"
                  />
                </div>

                <div>
                  <Label>Խնդիրի նկար (ոչ պարտադիր)</Label>
                  <FileUpload
                    value={problemImage}
                    onChange={setProblemImage}
                    label="Վերբեռնել նկար (առավելագույնը 5MB)"
                  />
                </div>

                {problemImage && (
                  <FileViewer
                    url={problemImage}
                    title="Խնդիրի նկար"
                    className="mt-4"
                  />
                )}
              </CardContent>
            </Card>

            {/* Solution Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔧</span>
                  Լուծման քայլեր (ոչ պարտադիր)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MathEditor
                  value={solutionSteps}
                  onChange={setSolutionSteps}
                  height={300}
                  placeholder="Լուծման քայլ առ քայլ նկարագրություն...

Օրինակ՝
## Լուծում

Տատիկի տուն հասնելու ժամանակը՝ `t = S/u`

Գայլի կերած կարկանդակների քանակը՝ `N' = t/t' = 10`"
                />
              </CardContent>
            </Card>

            {/* Correct Answer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>✅</span>
                  Ճիշտ պատասխան (ոչ պարտադիր)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="answer">Վերջնական պատասխան</Label>
                  <Input
                    id="answer"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="Օրինակ՝ 10"
                  />
                  <p className="text-sm text-gray-500">
                    Այս պատասխանը կգաղտնագրվի և կօգտագործվի ուսանողների
                    պատասխանները ստուգելու համար:
                  </p>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </main>
    </div>
  );
}
