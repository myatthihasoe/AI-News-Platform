import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthPageShell, authAppearance } from "@/components/auth/auth-page-shell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Biasly account.",
};

export default function SignInPage() {
  return (
    <AuthPageShell>
      <SignIn appearance={authAppearance} />
    </AuthPageShell>
  );
}
