import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthPageShell, authAppearance } from "@/components/auth/auth-page-shell";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Biasly account.",
};

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <SignUp appearance={authAppearance} />
    </AuthPageShell>
  );
}
