import { z } from "zod";

export const wordInputSchema = z.object({
  word: z.string().trim().min(1, "Informe uma palavra.").max(80),
  translation: z.string().trim().min(1, "Informe a tradução.").max(120),
  example: z
    .string()
    .trim()
    .max(200, "A frase deve ter no máximo 200 caracteres.")
    .transform((value) => value || null),
});
