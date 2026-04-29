import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV = Buffer.alloc(16, 0);

function getKey() {
  const key = process.env.CRYPTO_SECRET;

  if (!key) {
    throw new Error("CRYPTO_SECRET is missing in .env");
  }

  if (key.length !== 32) {
    throw new Error("CRYPTO_SECRET must be 32 characters");
  }

  return Buffer.from(key);
}

export function encrypt(text) {
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    getKey(),
    IV
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(text) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    IV
  );

  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}