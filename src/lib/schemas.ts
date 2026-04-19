import * as z from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3, "Identifier required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  fullName: z.string().min(3, "Full name required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters for institutional security"),
  role: z.enum(["TEACHER", "STUDENT", "PARENT"]),
  facultyId: z.string().optional(),
  rollNumber: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
