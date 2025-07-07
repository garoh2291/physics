"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Type,
  Copy,
  Divide,
  Equal,
  Plus,
} from "lucide-react";
import { useState } from "react";

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

// Enhanced paste handler that preserves mathematical formatting
function processMatematicalText(text: string): string {
  let processed = text;

  // Handle common mathematical patterns from PDFs
  // Fractions like "S/u" -> proper math notation
  processed = processed.replace(
    /([A-Za-zա-ֆ0-9′']+)\s*\/\s*([A-Za-zա-ֆ0-9′']+)/g,
    '<span class="math-formula">$1/$2</span>'
  );

  // Equations like "t = S/u"
  processed = processed.replace(
    /([A-Za-zա-ֆ′']+)\s*=\s*([^=\n]+)/g,
    '<span class="math-formula">$1 = $2</span>'
  );

  // Variables with subscripts/superscripts (t₀, N′, etc.)
  processed = processed.replace(
    /([A-Za-zա-ֆ])([₀₁₂₃₄₅₆₇₈₉′'ʹ]+)/g,
    '<span class="math-var">$1$2</span>'
  );

  // Standalone variables (N, t, v, u, S, etc.)
  processed = processed.replace(
    /\b([A-Za-z][′'ʹ]?[₀₁₂₃₄₅₆₇₈₉]*)\b(?!\s*[=\/])/g,
    '<span class="math-var">$1</span>'
  );

  // Units (մ/վ, կմ/ժ, etc.)
  processed = processed.replace(
    /\b([ա-ֆ]+\/[ա-ֆ]+|[ա-ֆ])\b/g,
    '<span class="math-unit">$1</span>'
  );

  // Numbers with units
  processed = processed.replace(
    /(\d+(?:\.\d+)?)\s*([ա-ֆ\/]+)/g,
    '$1 <span class="math-unit">$2</span>'
  );

  return processed;
}

// Convert to markdown preserving math
function htmlToMarkdown(html: string): string {
  let markdown = html;

  // Headers
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, "# $1");
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, "## $1");
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, "### $1");

  // Text formatting
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, "**$1**");
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, "*$1*");

  // Math elements
  markdown = markdown.replace(
    /<span class="math-formula">(.*?)<\/span>/g,
    "`$1`"
  );
  markdown = markdown.replace(
    /<span class="math-var">(.*?)<\/span>/g,
    "**$1**"
  );
  markdown = markdown.replace(/<span class="math-unit">(.*?)<\/span>/g, "_$1_");

  // Clean HTML
  markdown = markdown.replace(/<p>/g, "");
  markdown = markdown.replace(/<\/p>/g, "\n");
  markdown = markdown.replace(/<br>/g, "\n");
  markdown = markdown.replace(/&nbsp;/g, " ");
  markdown = markdown.replace(/\n\s*\n\s*\n/g, "\n\n");

  return markdown.trim();
}

// Convert markdown to HTML
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");

  // Text formatting
  html = html.replace(/\*\*(.*?)\*\*/g, '<span class="math-var">$1</span>');
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Math elements
  html = html.replace(/`([^`]+)`/g, '<span class="math-formula">$1</span>');
  html = html.replace(
    /_([\w\/\²\³\¹°]+)_/g,
    '<span class="math-unit">$1</span>'
  );

  // Paragraphs
  html = html.replace(/^(?!<[h|u|o|l])(.*$)/gm, "<p>$1</p>");
  html = html.replace(/\n/g, "<br>");

  return html;
}

// Utility function to convert number/letter to superscript
function toSuperscript(text: string): string {
  const superscriptMap: { [key: string]: string } = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    a: "ᵃ",
    b: "ᵇ",
    c: "ᶜ",
    d: "ᵈ",
    e: "ᵉ",
    f: "ᶠ",
    g: "ᵍ",
    h: "ʰ",
    i: "ⁱ",
    j: "ʲ",
    k: "ᵏ",
    l: "ˡ",
    m: "ᵐ",
    n: "ⁿ",
    o: "ᵒ",
    p: "ᵖ",
    r: "ʳ",
    s: "ˢ",
    t: "ᵗ",
    u: "ᵘ",
    v: "ᵛ",
    w: "ʷ",
    x: "ˣ",
    y: "ʸ",
    z: "ᶻ",
    A: "ᴬ",
    B: "ᴮ",
    D: "ᴰ",
    E: "ᴱ",
    G: "ᴳ",
    H: "ᴴ",
    I: "ᴵ",
    J: "ᴶ",
    K: "ᴷ",
    L: "ᴸ",
    M: "ᴹ",
    N: "ᴺ",
    O: "ᴼ",
    P: "ᴾ",
    R: "ᴿ",
    T: "ᵀ",
    U: "ᵁ",
    V: "ⱽ",
    W: "ᵂ",
  };

  return text
    .split("")
    .map((char) => superscriptMap[char] || char)
    .join("");
}

// Utility function to convert number/letter to subscript
function toSubscript(text: string): string {
  const subscriptMap: { [key: string]: string } = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
    a: "ₐ",
    e: "ₑ",
    h: "ₕ",
    i: "ᵢ",
    j: "ⱼ",
    k: "ₖ",
    l: "ₗ",
    m: "ₘ",
    n: "ₙ",
    o: "ₒ",
    p: "ₚ",
    r: "ᵣ",
    s: "ₛ",
    t: "ₜ",
    u: "ᵤ",
    v: "ᵥ",
    x: "ₓ",
  };

  return text
    .split("")
    .map((char) => subscriptMap[char] || char)
    .join("");
}

export function MathEditor({
  value,
  onChange,
  height = 400,
  placeholder,
}: MathEditorProps) {
  const [showMarkdown, setShowMarkdown] = useState(false);

  // Dynamic variable builder state
  const [selectedLetter, setSelectedLetter] = useState<string>("t");
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [hasApostrophe, setHasApostrophe] = useState<boolean>(false);

  // Superscript/subscript state
  const [superscriptText, setSuperscriptText] = useState<string>("");
  const [subscriptText, setSubscriptText] = useState<string>("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder:
          placeholder || "Սկսեք գրել... Տեղադրեք մաթեմատիկական տեքստ Ctrl+V-ով",
      }),
    ],
    content: markdownToHtml(value),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        style: `min-height: ${height - 180}px;`,
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (text) {
          // Smart mathematical content processing
          const cleanText = text
            .replace(/\s+/g, " ")
            .replace(/['']/g, "'")
            .replace(/[""]/g, '"')
            .replace(/−/g, "-")
            .trim();

          // Process mathematical patterns
          const processedHtml = processMatematicalText(cleanText);

          // Insert as HTML content
          editor?.commands.insertContent(processedHtml);
          return true;
        }
        return false;
      },
    },
  });

  // Generate alphabet for dropdown
  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(97 + i)
  );

  // Build dynamic variable
  const buildVariable = (): string => {
    let variable = isUppercase ? selectedLetter.toUpperCase() : selectedLetter;
    if (hasApostrophe) {
      variable += "'";
    }
    return variable;
  };

  // Insert functions
  const insertFraction = () => {
    editor
      ?.chain()
      .focus()
      .insertContent('<span class="math-formula">a/b</span> ')
      .run();
  };

  const insertEquation = () => {
    editor
      ?.chain()
      .focus()
      .insertContent('<span class="math-formula">x = y</span> ')
      .run();
  };

  const insertDynamicVariable = () => {
    const variable = buildVariable();
    editor
      ?.chain()
      .focus()
      .insertContent(`<span class="math-var">${variable}</span> `)
      .run();
  };

  const insertSuperscript = () => {
    if (superscriptText.trim()) {
      const superscript = toSuperscript(superscriptText.trim());
      editor
        ?.chain()
        .focus()
        .insertContent(`<span class="math-formula">${superscript}</span> `)
        .run();
      setSuperscriptText("");
    }
  };

  const insertSubscript = () => {
    if (subscriptText.trim()) {
      const subscript = toSubscript(subscriptText.trim());
      editor
        ?.chain()
        .focus()
        .insertContent(`<span class="math-var">${subscript}</span> `)
        .run();
      setSubscriptText("");
    }
  };

  const insertUnit = (unit: string) => {
    editor
      ?.chain()
      .focus()
      .insertContent(`<span class="math-unit">${unit}</span> `)
      .run();
  };

  const insertSymbol = (symbol: string) => {
    editor
      ?.chain()
      .focus()
      .insertContent(`<span class="math-formula">${symbol}</span> `)
      .run();
  };

  const copyMarkdown = () => {
    const markdown = htmlToMarkdown(editor?.getHTML() || "");
    navigator.clipboard.writeText(markdown);
    const toast = document.createElement("div");
    toast.textContent = "Markdown կոպիվել է!";
    toast.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded z-50";
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  if (!editor) {
    return <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />;
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {/* Enhanced Toolbar */}
      <div className="border-b p-3 space-y-3 bg-gray-50/80">
        {/* Row 1: Basic formatting */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`h-8 ${
                editor.isActive("bold") ? "bg-blue-100 border-blue-300" : ""
              }`}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`h-8 ${
                editor.isActive("italic") ? "bg-blue-100 border-blue-300" : ""
              }`}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 my-1" />

          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={`h-8 ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-blue-100 border-blue-300"
                  : ""
              }`}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={`h-8 ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-blue-100 border-blue-300"
                  : ""
              }`}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 my-1" />

          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyMarkdown}
              className="h-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMarkdown(!showMarkdown)}
              className={`h-8 ${showMarkdown ? "bg-gray-200" : ""}`}
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Row 2: Dynamic Variable Builder */}
        <div className="flex gap-2 flex-wrap items-center bg-purple-50 p-2 rounded">
          <span className="text-xs text-purple-700 font-medium">
            🔤 Փոփոխական:
          </span>

          <Select value={selectedLetter} onValueChange={setSelectedLetter}>
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {alphabet.map((letter) => (
                <SelectItem key={letter} value={letter}>
                  {letter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant={isUppercase ? "default" : "outline"}
            size="sm"
            onClick={() => setIsUppercase(!isUppercase)}
            className="h-8 text-xs"
          >
            {isUppercase ? "Մեծ" : "Փոքր"}
          </Button>

          <Button
            type="button"
            variant={hasApostrophe ? "default" : "outline"}
            size="sm"
            onClick={() => setHasApostrophe(!hasApostrophe)}
            className="h-8 text-xs"
          >
            {hasApostrophe ? "Ապաց '" : "Ապաց"}
          </Button>

          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border">
            <span className="text-sm text-purple-600 font-serif">
              {buildVariable()}
            </span>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={insertDynamicVariable}
            className="h-8 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ավելացնել
          </Button>
        </div>

        {/* Row 3: Super/Subscript Builder */}
        <div className="flex gap-4 flex-wrap items-center bg-blue-50 p-2 rounded">
          <div className="flex gap-2 items-center">
            <span className="text-xs text-blue-700 font-medium">⬆️ Վերին:</span>
            <Input
              type="text"
              value={superscriptText}
              onChange={(e) => setSuperscriptText(e.target.value)}
              placeholder="2, x, abc"
              className="w-20 h-8 text-sm"
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={insertSuperscript}
              disabled={!superscriptText.trim()}
              className="h-8 bg-blue-600 hover:bg-blue-700"
            >
              Ավելացնել
            </Button>
            {superscriptText && (
              <span className="text-sm text-blue-600">
                → {toSuperscript(superscriptText)}
              </span>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs text-blue-700 font-medium">⬇️ Ներքև:</span>
            <Input
              type="text"
              value={subscriptText}
              onChange={(e) => setSubscriptText(e.target.value)}
              placeholder="0, i, xyz"
              className="w-20 h-8 text-sm"
            />
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={insertSubscript}
              disabled={!subscriptText.trim()}
              className="h-8 bg-blue-600 hover:bg-blue-700"
            >
              Ավելացնել
            </Button>
            {subscriptText && (
              <span className="text-sm text-blue-600">
                → {toSubscript(subscriptText)}
              </span>
            )}
          </div>
        </div>

        {/* Row 4: Quick Tools */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-gray-600 flex items-center">
            🧮 Գործիքներ:
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={insertFraction}
            className="h-8 text-blue-600 hover:bg-blue-50"
            title="Կոտորակ"
          >
            <Divide className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={insertEquation}
            className="h-8 text-blue-600 hover:bg-blue-50"
            title="Հավասարություն"
          >
            <Equal className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 my-1" />

          {/* Common units */}
          <div className="flex gap-1">
            {["մ/վ", "կմ/ժ", "մ", "կմ", "վ", "ր"].map((unit) => (
              <Button
                key={unit}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertUnit(unit)}
                className="h-8 text-green-600 text-xs hover:bg-green-50"
                title={`Միավոր ${unit}`}
              >
                {unit}
              </Button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300 my-1" />

          {/* Math symbols */}
          <div className="flex gap-1">
            {["=", "+", "-", "×", "÷"].map((symbol) => (
              <Button
                key={symbol}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertSymbol(symbol)}
                className="h-8 text-gray-700 hover:bg-gray-50"
                title={`Նշան ${symbol}`}
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative" style={{ minHeight: height - 180 }}>
        {showMarkdown ? (
          <div className="p-4 font-mono text-sm bg-gray-50 h-full overflow-auto whitespace-pre-wrap">
            {htmlToMarkdown(editor.getHTML())}
          </div>
        ) : (
          <EditorContent editor={editor} className="h-full" />
        )}
      </div>

      {/* Enhanced Footer */}
      <div className="border-t px-3 py-2 text-xs text-gray-500 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>💾 Markdown ֆորմատ</span>
            <span>📋 Ctrl+V՝ ավտոմատ մաթ ֆորմատ</span>
            <span>🎯 Դինամիկ մաթ գործիքներ</span>
          </div>
          <span>Ctrl+B՝ թավ, Ctrl+I՝ շեղ</span>
        </div>
      </div>
    </div>
  );
}
