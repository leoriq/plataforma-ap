import { z } from 'zod';

export const ExternalGradeZod = z.object({
    studentUserId: z.string({
        required_error: 'Student User ID is required',
        invalid_type_error: 'Student User ID must be a string',
    }),
    grade: z
        .number({
            required_error: 'Grade is required',
            invalid_type_error: 'Grade must be a number between 0 and 10',
        })
        .min(0, { message: 'Grade must be at least 0' })
        .max(10, { message: 'Grade must be at most 10' }),
    weight: z
        .number({
            required_error: 'Weight is required',
            invalid_type_error: 'Weight must be a number',
        })
        .min(0, { message: 'Weight must be at least 0' }),
    description: z
        .string({
            required_error: 'Description is required',
            invalid_type_error: 'Description must be a string',
        })
        .max(50, { message: 'Description must be at most 50 characters' })
        .optional(),
});

export type ExternalGrade = z.infer<typeof ExternalGradeZod>;
