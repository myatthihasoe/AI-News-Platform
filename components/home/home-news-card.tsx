import Image from "next/image";
import Link from "next/link";
import { BiasMeter } from "@/components/design-system/primitives";
import { Icon } from "@/components/design-system/icons";
import type { HomeArticle } from "@/lib/news/preview-articles";
import styles from "./home.module.css";

export type { HomeArticle } from "@/lib/news/preview-articles";

type HomeNewsCardProps = {
  article: HomeArticle;
};

export function HomeNewsCard({ article }: HomeNewsCardProps) {
  const content = <CardContent article={article} />;

  return (
    <article className={styles.newsCard}>
      {article.href ? (
        <Link className={styles.cardLink} href={article.href} aria-label={`Read ${article.title}`}>
          {content}
        </Link>
      ) : content}
    </article>
  );
}

function CardContent({ article }: HomeNewsCardProps) {
  return (
    <>
      <div className={styles.cardMedia}>
        <Image
          alt={article.imageAlt}
          className={styles.cardImage}
          fill
          loading={article.id === "iran-peace-proposal" ? "eager" : "lazy"}
          sizes="(max-width: 620px) calc(100vw - 32px), (max-width: 900px) 50vw, 33vw"
          src={article.imageUrl}
        />
        <span className={styles.cardInfo} role="img" aria-label="Article framing information">
          <Icon name="info" size={16} />
        </span>
      </div>
      <div className={styles.cardContent}>
        <p className={styles.cardEyebrow}>{article.category}<span aria-hidden="true"> · </span>{article.region}</p>
        <h2 className={styles.cardTitle}>{article.title}</h2>
        <div className={styles.cardMeter}>
          <BiasMeter
            center={article.center}
            compact
            labelMode="short"
            left={article.left}
            right={article.right}
            showScale={false}
          />
        </div>
        <p className={styles.sourceCount}>{article.sourceCount} {article.sourceCount === 1 ? "source" : "sources"}</p>
      </div>
    </>
  );
}
