import Image from "next/image";
import { BiasMeter } from "@/components/design-system/primitives";
import { Icon } from "@/components/design-system/icons";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import type { NewsArticleDetail } from "@/lib/news/preview-articles";
import { AnalysisSidebar } from "./analysis-panel";
import { NewsletterBanner } from "./newsletter-banner";
import { RelatedStoryCard } from "./related-story-card";
import styles from "./news-details.module.css";

type NewsDetailsProps = {
  article: NewsArticleDetail;
};

export function NewsDetails({ article }: NewsDetailsProps) {
  return (
    <div className={styles.page}>
      <HomeHeader homeActive={false} />

      <main className={styles.shell}>
        <div className={styles.contentGrid}>
          <article className={styles.article}>
            <header className={styles.articleHeader}>
              <p className={styles.eyebrow}>
                {article.category}<span aria-hidden="true"> · </span>{article.region}
              </p>
              <h1>{article.title}</h1>
              <div className={styles.articleMetaRow}>
                <div className={styles.articleMeta}>
                  <span>By <strong>{article.author}</strong></span>
                  <span className={styles.metaDivider} aria-hidden="true" />
                  <time dateTime={article.publishedAt}>{article.publishedLabel}</time>
                  <span className={styles.metaDivider} aria-hidden="true" />
                  <span>{article.readTime}</span>
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
                />
              </div>
              <figcaption>
                <span>{article.imageCaption}</span>
                <span>Photo: {article.imageCredit}</span>
              </figcaption>
            </figure>

            <section className={styles.biasDistribution} aria-labelledby="bias-distribution-heading">
              <div className={styles.sectionLabel}>
                <h2 id="bias-distribution-heading">Bias Distribution</h2>
                <Icon name="info" size={15} />
              </div>
              <BiasMeter
                center={article.center}
                compact
                left={article.left}
                right={article.right}
                showScale={false}
              />
              <p>{article.sourceCount} sources</p>
            </section>

            <div className={styles.articleBody}>
              {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>

            <section className={styles.relatedSection} aria-labelledby="related-stories-heading">
              <h2 id="related-stories-heading">Related Stories</h2>
              <div className={styles.relatedGrid}>
                {article.relatedStories.map((story) => <RelatedStoryCard key={story.id} story={story} />)}
              </div>
            </section>
          </article>

          <AnalysisSidebar article={article} />
        </div>

        <NewsletterBanner />
      </main>

      <HomeFooter />
    </div>
  );
}
