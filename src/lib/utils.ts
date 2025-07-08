import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Encrypt function for saving correct answers
export function encrypt(text: string): string {
  try {
    const algorithm = "aes-256-cbc";
    const key = Buffer.from(
      process.env.ENCRYPTION_KEY || "default-key-for-development",
      "utf8"
    );

    // Create a 32-byte key from the provided key
    const keyBuffer = crypto.createHash("sha256").update(key).digest();

    // Generate a random IV
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Return IV + encrypted text
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Return original text if encryption fails
  }
}

// Decrypt function for admins
export function decrypt(encryptedText: string): string {
  try {
    const algorithm = "aes-256-cbc";
    const key = Buffer.from(
      process.env.ENCRYPTION_KEY || "default-key-for-development",
      "utf8"
    );

    // Create a 32-byte key from the provided key
    const keyBuffer = crypto.createHash("sha256").update(key).digest();

    // Split IV and encrypted text
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "Decryption failed";
  }
}

// Check if text is encrypted (has the format iv:encrypted)
export function isEncrypted(text: string): boolean {
  return text.includes(":") && text.split(":").length === 2;
}

// Safe decrypt function that handles both encrypted and unencrypted text
export function safeDecrypt(text: string): string {
  if (!text) return "";

  // If it's not encrypted, return as is
  if (!isEncrypted(text)) {
    return text;
  }

  // If it's encrypted, try to decrypt
  try {
    return decrypt(text);
  } catch (error) {
    console.error("Safe decrypt error:", error);
    return text; // Return original if decryption fails
  }
}
