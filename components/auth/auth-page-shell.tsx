import type { ReactNode } from "react";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import styles from "./auth-page.module.css";

type AuthPageShellProps = {
  children: ReactNode;
};

export const authAppearance = {
  variables: {
    colorPrimary: "#17191c",
    colorText: "#0d0d0f",
    colorTextSecondary: "#656970",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0d0d0f",
    borderRadius: "6px",
    fontFamily: "var(--font-poppins), Arial, Helvetica, sans-serif",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    cardBox: {
      width: "100%",
      boxShadow: "none",
    },
    card: {
      width: "100%",
      border: "1px solid #d5d7da",
      boxShadow: "0 12px 28px rgba(17, 19, 22, 0.08)",
    },
    formButtonPrimary: {
      boxShadow: "none",
      fontWeight: "600",
    },
    footerActionLink: {
      color: "#1d4ed8",
      fontWeight: "600",
    },
  },
} as const;

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className={styles.page}>
      <HomeHeader homeActive={false} />
      <main className={styles.main}>
        <div className={styles.authContainer}>{children}</div>
      </main>
      <HomeFooter />
    </div>
  );
}
