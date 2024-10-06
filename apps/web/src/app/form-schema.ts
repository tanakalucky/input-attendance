import { z } from 'zod';

export const formSchema = z.object({
  attendance: z
    .array(
      z.object({
        day: z.string(),
        start: z.string(),
        end: z.string(),
        rest: z.string(),
      }),
    )
    .transform((value) => {
      return JSON.stringify(value);
    }),
});

export type FormInput = z.input<typeof formSchema>;
export type FormOutput = z.output<typeof formSchema>;
