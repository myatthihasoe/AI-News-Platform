import Image from "next/image";
import Link from "next/link";
import type { RelatedArticleDto } from "@/lib/supabase/dto";
import styles from "./news-details.module.css";

type RelatedArticlesProps = {
  articles: readonly RelatedArticleDto[];
};

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className={styles.relatedSection} aria-labelledby="related-articles-heading">
      <h2 id="related-articles-heading">Related Articles</h2>
      <div className={styles.relatedGrid}>
        {articles.map((article) => (
          <Link className={styles.relatedCard} href={`/news/${article.slug}`} key={article.id}>
            <div className={styles.relatedMedia}>
              <Image
                alt={article.imageAlt}
                className={styles.relatedImage}
                fill
                sizes="(max-width: 560px) 96px, (max-width: 820px) 30vw, 180px"
                src={article.imageUrl}
                unoptimized
              />
            </div>
            <div className={styles.relatedContent}>
              <p>{article.source.name}</p>
              <h3>{article.title}</h3>
              <div>
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}
