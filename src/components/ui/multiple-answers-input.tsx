"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { UnitSelector } from "@/components/ui/unit-selector";

interface MultipleAnswersInputProps {
  answerValues: string[];
  onAnswerValuesChange: (values: string[]) => void;
  answerUnits: string[];
  onAnswerUnitsChange: (units: string[]) => void;
  placeholder?: string;
  onCurrentInputChange?: (value: string, unit: string) => void;
}

export function MultipleAnswersInput({
  answerValues,
  onAnswerValuesChange,
  answerUnits,
  onAnswerUnitsChange,
  placeholder = "Օրինակ՝ 42",
  onCurrentInputChange,
}: MultipleAnswersInputProps) {
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState("");

  const handleAddValue = () => {
    if (newValue.trim()) {
      const trimmedValue = newValue.trim();
      const trimmedUnit = newUnit.trim();

      // Check if this combination of value+unit already exists
      const existingIndex = answerValues.findIndex(
        (val, idx) =>
          val === trimmedValue && (answerUnits[idx] || "") === trimmedUnit
      );

      if (existingIndex === -1) {
        onAnswerValuesChange([...answerValues, trimmedValue]);
        onAnswerUnitsChange([...answerUnits, trimmedUnit]);
        setNewValue("");
        setNewUnit("");
      }
    }
  };

  const handleRemoveValue = (index: number) => {
    onAnswerValuesChange(answerValues.filter((_, i) => i !== index));
    onAnswerUnitsChange(answerUnits.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddValue();
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Answer Values with Units */}
      {answerValues.length > 0 && (
        <div>
          <Label className="text-sm font-medium">
            Ճիշտ պատասխաններ ({answerValues.length})
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {answerValues.map((value, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {value}
                {answerUnits[index] ? ` ${answerUnits[index]}` : ""}
                <button
                  onClick={() => handleRemoveValue(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add New Answer Value and Unit */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Ավելացնել նոր պատասխան</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder={placeholder}
              value={newValue}
              onChange={(e) => {
                setNewValue(e.target.value);
                onCurrentInputChange?.(e.target.value, newUnit);
              }}
              onKeyPress={handleKeyPress}
              className="text-sm"
            />
          </div>
          <div className="w-32">
            <UnitSelector
              value={newUnit}
              onValueChange={(value) => {
                setNewUnit(value);
                onCurrentInputChange?.(newValue, value);
              }}
              placeholder="Միավոր"
              className="w-full text-sm"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddValue}
            disabled={!newValue.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ավելացնել
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Արժեք և դրա միավորը լրացրեք: Ընտրեք միավորը ցուցակից կամ ստեղծեք նորը:
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Հուշում:</strong> Ավելացրեք բոլոր հնարավոր ճիշտ պատասխանները և
          դրանց միավորները: Ուսանողի պատասխանը կհամեմատվի այս ցուցակի հետ:
        </p>
      </div>

      {/* Validation */}
      {answerValues.length === 0 && (
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Նշում:</strong> Ավելացրեք առնվազն մեկ ճիշտ պատասխանի արժեք:
          </p>
        </div>
      )}
    </div>
  );
}
