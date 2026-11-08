import { randomInt } from "node:crypto";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const ALL_CHARS = LETTERS + DIGITS;

export function generateCaptchaCode(): string {
  const chars: string[] = [
    LETTERS[randomInt(0, LETTERS.length)]!,
    DIGITS[randomInt(0, DIGITS.length)]!,
  ];

  for (let i = 2; i < 7; i += 1) {
    chars.push(ALL_CHARS[randomInt(0, ALL_CHARS.length)]!);
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i + 1);
    const temp = chars[i]!;
    chars[i] = chars[j]!;
    chars[j] = temp;
  }

  return chars.join("");
}
