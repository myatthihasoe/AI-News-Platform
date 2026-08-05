import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/design-system/icons";
import { BiasMeter } from "@/components/design-system/primitives";
import type { ArticleFeedItem } from "@/lib/supabase/dto";
import styles from "./home.module.css";

type HomeNewsCardProps = {
  article: ArticleFeedItem;
  priority?: boolean;
};

export function HomeNewsCard({ article, priority = false }: HomeNewsCardProps) {
  return (
    <article className={styles.newsCard}>
      <Link className={styles.cardLink} href={`/news/${article.slug}`} aria-label={`Read ${article.title}`}>
        <div className={styles.cardMedia}>
          <Image
            alt={article.imageAlt}
            className={styles.cardImage}
            fill
            priority={priority}
            sizes="(max-width: 620px) calc(100vw - 32px), (max-width: 900px) 50vw, 33vw"
            src={article.imageUrl}
            unoptimized
          />
          <span className={styles.cardInfo} role="img" aria-label="Article framing information">
            <Icon name="info" size={16} />
          </span>
        </div>
        <div className={styles.cardContent}>
          <p className={styles.cardEyebrow}>{formatEyebrow(article)}</p>
          <h2 className={styles.cardTitle}>{article.title}</h2>
          <div className={styles.cardMeter}>
            <BiasMeter
              center={article.analysis.centerPercentage}
              compact
              labelMode="short"
              left={article.analysis.leftPercentage}
              right={article.analysis.rightPercentage}
              showScale={false}
            />
          </div>
          <p className={styles.sourceName}>{article.source.name}</p>
        </div>
      </Link>
    </article>
  );
}

function formatEyebrow(article: ArticleFeedItem) {
  return [article.category, article.region].filter(Boolean).join(" · ") || "Latest";
}
