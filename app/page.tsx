import type { Metadata } from "next";
import { CategoryRail } from "@/components/home/category-rail";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { HomeNewsCard } from "@/components/home/home-news-card";
import { homeArticles } from "@/lib/news/preview-articles";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Biasly" },
  description: "Balanced news coverage with AI-estimated sentiment and political framing insights.",
};

export default function HomePage() {
  return (
    <div className={styles.page}>
      <HomeHeader />
      <CategoryRail />
      <main className={styles.main}>
        <section aria-labelledby="top-news">
          <h1 id="top-news" className={styles.heading}>Top News</h1>
          <div className={styles.newsGrid}>
            {homeArticles.map((article) => <HomeNewsCard article={article} key={article.id} />)}
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
