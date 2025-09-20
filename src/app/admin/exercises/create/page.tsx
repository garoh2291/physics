"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { MathEditor } from "@/components/math-editor";
import { FileUpload } from "@/components/ui/file-upload";
import { FileViewer } from "@/components/ui/file-viewer";
import { TagSelector } from "@/components/ui/tag-selector";
import { SourceSelector } from "@/components/ui/source-selector";
import { SectionSelector } from "@/components/ui/section-selector";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { MultipleAnswersInput } from "@/components/ui/multiple-answers-input";
import { useCreateExercise } from "@/hooks/use-api";

interface Source {
  id: string;
  name: string;
  url?: string | null;
}

interface Section {
  id: string;
  name: string;
  url?: string | null;
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

export default function CreateExercisePage() {
  const [exerciseNumber, setExerciseNumber] = useState("");
  const [level, setLevel] = useState(1);
  const [classGrade, setClassGrade] = useState<number | undefined>(undefined);
  const [problemText, setProblemText] = useState("");
  const [problemImage, setProblemImage] = useState("");
  const [solutionSteps, setSolutionSteps] = useState("");
  const [solutionImage, setSolutionImage] = useState("");
  const [correctAnswerValues, setCorrectAnswerValues] = useState<string[]>([]);
  const [answerUnits, setAnswerUnits] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<
    Array<{ id: string; name: string; url?: string | null }>
  >([]);
  const [selectedSources, setSelectedSources] = useState<Source[]>([]);
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>([]);
  const [hintText1, setHintText1] = useState("");
  const [hintImage1, setHintImage1] = useState("");
  const [hintText2, setHintText2] = useState("");
  const [hintImage2, setHintImage2] = useState("");
  const [hintText3, setHintText3] = useState("");
  const [hintImage3, setHintImage3] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const createExerciseMutation = useCreateExercise();

  // Handle section changes and clear themes when sections change
  const handleSectionsChange = (sections: Section[]) => {
    setSelectedSections(sections);
    // Clear themes that are not in the selected sections
    const validThemes = selectedThemes.filter((theme) =>
      sections.some((section) => section.id === theme.section.id)
    );
    if (validThemes.length !== selectedThemes.length) {
      setSelectedThemes(validThemes);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!exerciseNumber?.trim()) {
      setError("Վարժության համարը պարտադիր է");
      return;
    }
    if (!problemText.trim() && !problemImage) {
      setError("Խնդիրը պետք է պարունակի տեքստ կամ նկար");
      return;
    }
    if (!solutionSteps.trim() && !solutionImage) {
      setError("Լուծման քայլերը պետք է պարունակեն տեքստ կամ նկար");
      return;
    }
    if (correctAnswerValues.length === 0) {
      setError("Առնվազն մեկ ճիշտ պատասխանի արժեք պարտադիր է");
      return;
    }

    createExerciseMutation.mutate(
      {
        exerciseNumber,
        level,
        class: classGrade,
        problemText,
        problemImage,
        solutionSteps,
        solutionImage,
        correctAnswerValues,
        answerUnits,
        tagIds: selectedTags.map((tag) => tag.id),
        sourceIds: selectedSources.map((source) => source.id),
        sectionIds: selectedSections.map((section) => section.id),
        themeIds: selectedThemes.map((theme) => theme.id),
        hintText1,
        hintImage1,
        hintText2,
        hintImage2,
        hintText3,
        hintImage3,
      },
      {
        onSuccess: () => {
          router.push("/admin/exercises");
        },
        onError: (error: Error) => {
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/exercises">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Վերադառնալ</span>
                </Link>
              </Button>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                Նոր վարժություն
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

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Հիմնական տվյալներ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="exerciseNumber">Վարժության համար *</Label>
                <Input
                  id="exerciseNumber"
                  value={exerciseNumber}
                  onChange={(e) => setExerciseNumber(e.target.value)}
                  placeholder="Օրինակ՝ 1.2, A3, կամ թողեք դատարկ"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Մակարդակ *</Label>
                  <Select
                    value={level.toString()}
                    onValueChange={(value) => setLevel(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ընտրեք մակարդակ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Հեշտ</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5 - Դժվար</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class">Դասարան</Label>
                  <Select
                    value={classGrade ? classGrade.toString() : ""}
                    onValueChange={(value) =>
                      setClassGrade(value ? parseInt(value) : undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ընտրեք դասարանը (ոչ պարտադիր)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Given Data Section */}
          <Card>
            <CardHeader>
              <CardTitle>Խնդիր *</CardTitle>
              <p className="text-sm text-gray-600">
                Պարտադիր է մուտքագրել խնդրի տեքստ կամ վերբեռնել նկար
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="problemText">Խնդրի տեքստ</Label>
                <MathEditor
                  value={problemText}
                  onChange={setProblemText}
                  height={200}
                  placeholder="Մուտքագրեք խնդրի տեքստը..."
                />
              </div>
              <div>
                <Label>Խնդրի նկար</Label>
                <FileUpload
                  value={problemImage}
                  onChange={setProblemImage}
                  label="Վերբեռնել խնդրի նկար (առավելագույնը 5MB)"
                />
              </div>
              {problemImage && (
                <FileViewer
                  url={problemImage}
                  title="Խնդրի նկար"
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Solution Section */}
          <Card>
            <CardHeader>
              <CardTitle>Լուծման քայլեր *</CardTitle>
              <p className="text-sm text-gray-600">
                Պարտադիր է մուտքագրել լուծման տեքստ կամ վերբեռնել նկար
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="solutionSteps">Լուծման տեքստ</Label>
                <MathEditor
                  value={solutionSteps}
                  onChange={setSolutionSteps}
                  height={250}
                  placeholder="Մուտքագրեք լուծման քայլերը..."
                />
              </div>
              <div>
                <Label>Լուծման նկար</Label>
                <FileUpload
                  value={solutionImage}
                  onChange={setSolutionImage}
                  label="Վերբեռնել լուծման նկար (առավելագույնը 5MB)"
                />
              </div>
              {solutionImage && (
                <FileViewer
                  url={solutionImage}
                  title="Լուծման նկար"
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Correct Answers Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ճիշտ պատասխաններ *</CardTitle>
            </CardHeader>
            <CardContent>
              <MultipleAnswersInput
                answerValues={correctAnswerValues}
                onAnswerValuesChange={setCorrectAnswerValues}
                answerUnits={answerUnits}
                onAnswerUnitsChange={setAnswerUnits}
                placeholder="Օրինակ՝ 42 կամ 42.0 կամ 42,00"
              />
            </CardContent>
          </Card>

          {/* Hints Section */}
          <Card>
            <CardHeader>
              <CardTitle>Հուշումներ (ոչ պարտադիր)</CardTitle>
              <p className="text-sm text-gray-600">
                Ավելացրեք մինչև 3 հուշում ուսանողներին օգնելու համար
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hint 1 */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Հուշում 1</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hintText1" className="text-sm">
                      Հուշման տեքստ
                    </Label>
                    <MathEditor
                      value={hintText1}
                      onChange={setHintText1}
                      height={150}
                      placeholder="Մուտքագրեք առաջին հուշումը..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Հուշման նկար</Label>
                    <FileUpload
                      value={hintImage1}
                      onChange={setHintImage1}
                      label="Վերբեռնել հուշման նկար (առավելագույնը 5MB)"
                    />
                  </div>
                  {hintImage1 && (
                    <FileViewer
                      url={hintImage1}
                      title="Հուշում 1 նկար"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              {/* Hint 2 */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Հուշում 2</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hintText2" className="text-sm">
                      Հուշման տեքստ
                    </Label>
                    <MathEditor
                      value={hintText2}
                      onChange={setHintText2}
                      height={150}
                      placeholder="Մուտքագրեք երկրորդ հուշումը..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Հուշման նկար</Label>
                    <FileUpload
                      value={hintImage2}
                      onChange={setHintImage2}
                      label="Վերբեռնել հուշման նկար (առավելագույնը 5MB)"
                    />
                  </div>
                  {hintImage2 && (
                    <FileViewer
                      url={hintImage2}
                      title="Հուշում 2 նկար"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              {/* Hint 3 */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Հուշում 3</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hintText3" className="text-sm">
                      Հուշման տեքստ
                    </Label>
                    <MathEditor
                      value={hintText3}
                      onChange={setHintText3}
                      height={150}
                      placeholder="Մուտքագրեք երրորդ հուշումը..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Հուշման նկար</Label>
                    <FileUpload
                      value={hintImage3}
                      onChange={setHintImage3}
                      label="Վերբեռնել հուշման նկար (առավելագույնը 5MB)"
                    />
                  </div>
                  {hintImage3 && (
                    <FileViewer
                      url={hintImage3}
                      title="Հուշում 3 նկար"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selectors Section - All in one card with full width dropdowns */}
          <Card>
            <CardHeader>
              <CardTitle>Կատեգորիաներ (ոչ պարտադիր)</CardTitle>
              <p className="text-sm text-gray-600">
                Ընտրեք պիտակներ, աղբյուրներ, բաժիններ և թեմաներ
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Պիտակներ
                </label>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>

              {/* Sources */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Աղբյուրներ
                </label>
                <SourceSelector
                  selectedSources={selectedSources}
                  onSourcesChange={setSelectedSources}
                />
              </div>

              {/* Sections */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Բաժիններ
                </label>
                <SectionSelector
                  selectedSections={selectedSections}
                  onSectionsChange={handleSectionsChange}
                />
              </div>

              {/* Themes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Թեմաներ
                </label>
                <ThemeSelector
                  selectedThemes={selectedThemes}
                  onThemesChange={setSelectedThemes}
                  selectedSections={selectedSections}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={createExerciseMutation.isPending}
              className="text-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {createExerciseMutation.isPending ? "Պահպանվում..." : "Պահպանել"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
