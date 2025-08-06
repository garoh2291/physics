"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface MultipleAnswersInputProps {
  answers: string[];
  onAnswersChange: (answers: string[]) => void;
  placeholder?: string;
}

export function MultipleAnswersInput({
  answers,
  onAnswersChange,
  placeholder = "Օրինակ՝ 42",
}: MultipleAnswersInputProps) {
  const [newAnswer, setNewAnswer] = useState("");

  const handleAddAnswer = () => {
    if (newAnswer.trim() && !answers.includes(newAnswer.trim())) {
      onAnswersChange([...answers, newAnswer.trim()]);
      setNewAnswer("");
    }
  };

  const handleRemoveAnswer = (index: number) => {
    onAnswersChange(answers.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAnswer();
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Answers */}
      {answers.length > 0 && (
        <div>
          <Label className="text-sm font-medium">
            Ճիշտ պատասխաններ ({answers.length})
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {answers.map((answer, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {answer}
                <button
                  onClick={() => handleRemoveAnswer(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add New Answer */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder={placeholder}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAnswer}
          disabled={!newAnswer.trim() || answers.includes(newAnswer.trim())}
        >
          <Plus className="h-4 w-4 mr-1" />
          Ավելացնել
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Հուշում:</strong> Ավելացրեք բոլոր հնարավոր ճիշտ պատասխանները:
          Ուսանողի պատասխանը կհամեմատվի այս ցուցակի հետ:
        </p>
      </div>

      {/* Validation */}
      {answers.length === 0 && (
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Նշում:</strong> Ավելացրեք առնվազն մեկ ճիշտ պատասխան:
          </p>
        </div>
      )}
    </div>
  );
}
