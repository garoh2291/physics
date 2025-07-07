"use client";

import { FC, useState, useEffect } from "react";
import "katex/dist/katex.min.css";
import katex from "katex";

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

export const MathEditor: FC<MathEditorProps> = ({
  value,
  onChange,
  height = 400,
  placeholder = "Type math here, e.g. $d = \\sqrt{16t^2 + 64}$",
}) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    try {
      // Split content into text and math parts
      const parts = value.split(/(\$[^$]*\$)/);
      let rendered = "";

      for (const part of parts) {
        if (part.startsWith("$") && part.endsWith("$")) {
          // This is a math expression
          const mathContent = part.slice(1, -1);
          try {
            const mathRendered = katex.renderToString(mathContent, {
              throwOnError: false,
              displayMode: false,
            });
            rendered += mathRendered;
          } catch {
            rendered += part; // Keep original if math fails
          }
        } else {
          // This is regular text - preserve formatting
          rendered += part.replace(/\n/g, "<br>");
        }
      }

      setPreview(rendered);
    } catch {
      setPreview(value.replace(/\n/g, "<br>"));
    }
  }, [value]);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
        minHeight: height,
        padding: "12px",
      }}
      className="w-full"
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          minHeight: height - 100,
          border: "none",
          outline: "none",
          resize: "vertical",
          fontFamily: "monospace",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
        className="w-full text-sm md:text-base"
      />
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          marginTop: 16,
          paddingTop: 16,
        }}
      >
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
          Preview:
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: preview }}
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
          className="text-sm md:text-base overflow-x-auto"
        />
      </div>
    </div>
  );
};
