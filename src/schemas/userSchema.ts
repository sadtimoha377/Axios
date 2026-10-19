import { z } from "zod";

export const userSchema = z.object({
    firstName: z.string().min(2, "First name must have 2 symbols minimum"),
    lastName: z.string().min(2, "Last name must have 2 symbols minimum"),
    username: z.string().min(3, "Username must have 3 symbols minimum"),
    age: z.number("Age must be a number").min(1, "Minimal age is 1").max(120, "Maximal age is 120")
});

export type UserFormData = z.infer<typeof userSchema>;
