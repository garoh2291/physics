"use client";

import { FC, useEffect, useState } from "react";
import katex from "katex";

interface MathPreviewProps {
  value?: string | null;
  className?: string;
}

export const MathPreview: FC<MathPreviewProps> = ({ value, className }) => {
  const safeValue = value ?? "";
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    try {
      // Split content into text and math parts
      const parts = safeValue.split(/(\$[^$]*\$)/);
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
      setPreview(safeValue.replace(/\n/g, "<br>"));
    }
  }, [safeValue]);

  if (!safeValue) return null;

  return (
    <div
      className={className}
      style={{
        fontSize: "16px",
        lineHeight: "1.6",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
      }}
      dangerouslySetInnerHTML={{ __html: preview }}
    />
  );
};
