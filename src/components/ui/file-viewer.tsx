interface FileViewerProps {
  url: string;
  title?: string;
  className?: string;
}

export function FileViewer({ url, title, className = "" }: FileViewerProps) {
  const isPdf = url.toLowerCase().includes(".pdf") || url.includes("pdf");

  if (!url) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {title && <h3 className="font-medium text-gray-900">{title}</h3>}
      <div className="border rounded-lg overflow-hidden">
        {isPdf ? (
          <iframe
            src={url}
            title={title || "PDF Viewer"}
            className="w-full h-96"
            style={{ border: "none" }}
          />
        ) : (
          <img
            src={url}
            alt={title || "Image"}
            className="w-full h-auto max-h-96 object-contain"
          />
        )}
      </div>
    </div>
  );
}
