import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I - avoids OCR/handwriting ambiguity

// ONB-09 (frontend.md): every user gets a public MedGram ID at signup,
// distinct from the internal UUID primary key. Collisions are checked by the
// caller's INSERT (medgram_id has a UNIQUE constraint) - this only generates
// a candidate.
export function generateMedGramId(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `MG-${code}`;
}
