import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email address").transform((value) => value.toLowerCase());

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  email: emailSchema,
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(1, "Password is required").max(128, "Password is too long")
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const verifyResetTokenSchema = z.object({
  email: emailSchema,
  token: z.string().trim().min(20, "Reset token is invalid")
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  token: z.string().trim().min(20, "Reset token is invalid"),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
});
