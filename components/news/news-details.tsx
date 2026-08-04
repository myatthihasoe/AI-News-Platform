import Image from "next/image";
import { BiasMeter } from "@/components/design-system/primitives";
import { Icon } from "@/components/design-system/icons";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import type { ArticleDetail } from "@/lib/supabase/dto";
import { AnalysisSidebar } from "./analysis-panel";
import { NewsletterBanner } from "./newsletter-banner";
import styles from "./news-details.module.css";

type NewsDetailsProps = {
  article: ArticleDetail;
};

export function NewsDetails({ article }: NewsDetailsProps) {
  const publishedLabel = formatDate(article.publishedAt);
  const eyebrow = [article.category, article.region].filter(Boolean).join(" · ") || article.source.name;

  return (
    <div className={styles.page}>
      <HomeHeader homeActive={false} />

      <main className={styles.shell}>
        <div className={styles.contentGrid}>
          <article className={styles.article}>
            <header className={styles.articleHeader}>
              <p className={styles.eyebrow}>{eyebrow}</p>
              <h1>{article.title}</h1>
              <div className={styles.articleMetaRow}>
                <div className={styles.articleMeta}>
                  <span>{article.author ? <>By <strong>{article.author}</strong></> : article.source.name}</span>
                  <span className={styles.metaDivider} aria-hidden="true" />
                  <time dateTime={article.publishedAt}>{publishedLabel}</time>
                  {article.readTimeMinutes ? (
                    <>
                      <span className={styles.metaDivider} aria-hidden="true" />
                      <span>{article.readTimeMinutes} min read</span>
                    </>
                  ) : null}
                </div>
                <div className={styles.articleActions} aria-label="Article actions">
                  <button type="button">Save</button>
                  <button type="button" aria-label="Bookmark article"><Icon name="bookmark" size={18} /></button>
                  <button type="button">Share</button>
                  <button type="button" aria-label="Share article"><Icon name="share" size={18} /></button>
                  <button type="button" aria-label="More article options"><Icon name="more" size={19} /></button>
                </div>
              </div>
            </header>

            <figure className={styles.heroFigure}>
              <div className={styles.heroMedia}>
                <Image
                  alt={article.imageAlt}
                  className={styles.heroImage}
                  fill
                  priority
                  sizes="(max-width: 760px) calc(100vw - 28px), (max-width: 1100px) 64vw, 760px"
                  src={article.imageUrl}
                  unoptimized
                />
              </div>
            </figure>

            <section className={styles.biasDistribution} aria-labelledby="bias-distribution-heading">
              <div className={styles.sectionLabel}>
                <h2 id="bias-distribution-heading">AI-estimated framing</h2>
                <Icon name="info" size={15} />
              </div>
              <BiasMeter
                center={article.analysis.centerPercentage}
                compact
                left={article.analysis.leftPercentage}
                right={article.analysis.rightPercentage}
                showScale={false}
              />
              <p>Analysis of this {article.source.name} article</p>
            </section>

            <div className={styles.articleBody}>
              {article.body.map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}
            </div>
          </article>

          <AnalysisSidebar article={article} />
        </div>

        <NewsletterBanner />
      </main>

      <HomeFooter />
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}
