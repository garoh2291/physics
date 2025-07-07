"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calculator, Copy, Check, ExternalLink } from "lucide-react";

interface MathTypeIntegrationProps {
  onInsertLatex: (latex: string) => void;
}

export function MathTypeIntegration({
  onInsertLatex,
}: MathTypeIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [latexInput, setLatexInput] = useState("");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(latexInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const insertEquation = () => {
    if (!latexInput.trim()) return;
    onInsertLatex(latexInput.trim());
    setLatexInput("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="text-xs">
          <Calculator className="h-3 w-3 mr-1" />
          Equation Editor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Insert Equation (LaTeX)
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* External Editor Button */}
          <div>
            <Button asChild variant="outline" size="sm" className="mb-2">
              <a
                href="https://www.codecogs.com/latex/eqneditor.php"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Free Equation Editor (CodeCogs)
              </a>
            </Button>
            <span className="block text-xs text-gray-500 mt-1">
              Opens in a new tab. Create your equation, copy the LaTeX code, and
              paste it below.
            </span>
          </div>

          {/* LaTeX input/output */}
          <div className="space-y-2">
            <label className="text-sm font-medium">LaTeX Code:</label>
            <div className="flex space-x-2">
              <textarea
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                placeholder="Paste LaTeX code here..."
                className="flex-1 p-2 border rounded text-sm font-mono"
                rows={3}
                aria-label="LaTeX code input"
              />
              <div className="flex flex-col space-y-1">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="h-8"
                  aria-label="Copy LaTeX code"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  onClick={insertEquation}
                  size="sm"
                  className="h-8"
                  disabled={!latexInput.trim()}
                  aria-label="Insert equation"
                >
                  Insert
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Click <b>Open Free Equation Editor</b> to launch CodeCogs in a
                new tab.
              </li>
              <li>Create your equation and copy the LaTeX code.</li>
              <li>Paste it in the text area above.</li>
              <li>
                Click <b>Insert</b> to add it to your content.
              </li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
