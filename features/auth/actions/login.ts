"use server";

import { AuthError } from "next-auth";
import { loginSchema } from "@/features/auth/schema";
import { signIn } from "@/server/auth";

export type LoginActionState = { error?: string };

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/tickets",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // signIn() throws Next's internal NEXT_REDIRECT signal on success — must rethrow
    // anything that isn't an AuthError, or the redirect silently breaks.
    throw error;
  }

  return {};
}
