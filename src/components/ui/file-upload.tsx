import { useRef, useState } from "react";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  label,
  accept = "image/*,application/pdf",
  disabled,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      // Sanitize filename for Cloudinary public_id
      const sanitizeFileName = (fileName: string) => {
        return fileName
          .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace invalid chars with underscore
          .replace(/_{2,}/g, "_") // Replace multiple underscores with single
          .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
          .toLowerCase();
      };

      const timestamp = Date.now();
      const sanitizedName = sanitizeFileName(file.name);
      const publicId = `physics_exercises/${timestamp}_${sanitizedName}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("public_id", publicId);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned"
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!data.secure_url)
        throw new Error(data.error?.message || "Upload failed");
      onChange(data.secure_url);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        setError((err as { message: string }).message);
      } else {
        setError("Upload error");
      }
    } finally {
      setUploading(false);
    }
  };

  const isPdf = value?.endsWith(".pdf");

  return (
    <div className="space-y-2">
      {label && <label className="block font-medium mb-1">{label}</label>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
      <button
        type="button"
        className="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
      >
        {uploading ? "Բեռնվում է..." : value ? "Փոխել ֆայլը" : "Վերբեռնել ֆայլ"}
      </button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {value && (
        <div className="mt-2">
          {isPdf ? (
            <embed
              src={value}
              type="application/pdf"
              width="100%"
              height="400px"
              className="rounded border"
            />
          ) : (
            <img
              src={value}
              alt="Ներբեռնված ֆայլ"
              className="max-h-64 rounded border"
            />
          )}
        </div>
      )}
    </div>
  );
}
