import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(64, "Password cannot exceed 64 characters")
  .regex(
    /[a-z]/,
    "Password must contain a lowercase letter"
  )
  .regex(
    /[A-Z]/,
    "Password must contain an uppercase letter"
  )
  .regex(
    /[0-9]/,
    "Password must contain a number"
  )
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain a special character"
  );

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(
        2,
        "Full name must contain at least 2 characters"
      )
      .max(80, "Full name is too long"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),

    password: passwordSchema,

    confirmPassword: z
      .string()
      .min(1, "Confirm your password"),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(
      /^\d{6}$/,
      "Enter the 6-digit verification code"
    ),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .trim()
      .regex(
        /^\d{6}$/,
        "Enter the 6-digit reset code"
      ),

    newPassword: passwordSchema,

    confirmPassword: z
      .string()
      .min(
        1,
        "Confirm your new password"
      ),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(
      2,
      "Full name must contain at least 2 characters"
    )
    .max(80, "Full name is too long"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(
        1,
        "Current password is required"
      ),

    newPassword: passwordSchema,

    confirmPassword: z
      .string()
      .min(
        1,
        "Confirm your new password"
      ),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type LoginFormData =
  z.infer<typeof loginSchema>;

export type RegisterFormData =
  z.infer<typeof registerSchema>;

export type VerifyOtpFormData =
  z.infer<typeof verifyOtpSchema>;

export type ForgotPasswordFormData =
  z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordFormData =
  z.infer<typeof resetPasswordSchema>;

export type UpdateProfileFormData =
  z.infer<typeof updateProfileSchema>;

export type ChangePasswordFormData =
  z.infer<typeof changePasswordSchema>;