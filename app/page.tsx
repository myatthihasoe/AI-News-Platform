import type { Metadata } from "next";
import { connection } from "next/server";
import { CategoryRail } from "@/components/home/category-rail";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { HomeNewsCard } from "@/components/home/home-news-card";
import { getAnalyzedArticleFeed } from "@/lib/supabase/queries/articles";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Biasly" },
  description: "Balanced news coverage with AI-estimated sentiment and political framing insights.",
};

export default async function HomePage() {
  await connection();
  let feedUnavailable = false;
  let articles: Awaited<ReturnType<typeof getAnalyzedArticleFeed>> = [];

  try {
    articles = await getAnalyzedArticleFeed();
  } catch (error) {
    feedUnavailable = true;
    console.error("Unable to load the Biasly home feed.", error);
  }

  return (
    <div className={styles.page}>
      <HomeHeader />
      <CategoryRail />
      <main className={styles.main}>
        <section aria-labelledby="top-news">
          <h1 id="top-news" className={styles.heading}>Top News</h1>
          {articles.length > 0 ? (
            <div className={styles.newsGrid}>
              {articles.map((article, index) => (
                <HomeNewsCard article={article} key={article.id} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState} role="status">
              <h2>{feedUnavailable ? "News feed unavailable" : "No analyzed stories yet"}</h2>
              <p>
                {feedUnavailable
                  ? "The news database could not be reached. Please try again shortly."
                  : "Biasly will show articles here after the next scrape and AI analysis run."}
              </p>
            </div>
          )}
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
