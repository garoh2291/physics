"use client";

import { useState } from "react";

interface FileViewerProps {
  url: string;
  title?: string;
  className?: string;
}

export function FileViewer({ url, title, className = "" }: FileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!url) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {title && <h3 className="font-medium text-gray-900">{title}</h3>}
      <div className="border rounded-lg overflow-hidden">
        <img
          src={url}
          alt={title || "Image"}
          className="w-full h-auto max-h-96 object-contain"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        {error && (
          <div className="text-red-600 text-center p-4">
            Failed to load image
          </div>
        )}
      </div>
    </div>
  );
}
