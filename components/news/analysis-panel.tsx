import { Icon } from "@/components/design-system/icons";
import type { ArticleDetail } from "@/lib/supabase/dto";
import styles from "./news-details.module.css";

type AnalysisSidebarProps = {
  article: ArticleDetail;
};

type MeterRowProps = {
  label: "Left" | "Center" | "Right";
  value: number;
};

export function AnalysisSidebar({ article }: AnalysisSidebarProps) {
  const confidence = Math.round(article.analysis.confidence * 100);
  const framingLabel = article.analysis.biasLabel;
  const framingPercentage = getFramingPercentage(article);
  const framingClass = {
    left: styles.overallBiasLeft,
    center: styles.overallBiasCenter,
    right: styles.overallBiasRight,
    mixed: styles.overallBiasMixed,
    unclear: styles.overallBiasMixed,
  }[framingLabel];

  return (
    <aside className={styles.sidebar} aria-label="AI article analysis">
      <section className={styles.analysisCard} aria-labelledby="bias-analysis-heading">
        <PanelHeading id="bias-analysis-heading">Bias Analysis</PanelHeading>
        <p className={styles.overline}>AI-estimated overall framing</p>
        <p className={`${styles.overallBias} ${framingClass}`}>{capitalize(framingLabel)} {framingPercentage}%</p>
        <p className={styles.basedOn}>Based on the language in this {article.source.name} article</p>
        <div className={styles.analysisDivider} />
        <div className={styles.meterRows}>
          <MeterRow label="Left" value={article.analysis.leftPercentage} />
          <MeterRow label="Center" value={article.analysis.centerPercentage} />
          <MeterRow label="Right" value={article.analysis.rightPercentage} />
        </div>
        <p className={styles.confidence}><strong>{confidence}% confidence</strong> in this AI estimate</p>
        <p className={styles.explainer}>This estimate reflects wording, emphasis, and framing found in the stored article text. It is not an objective judgment of the publication.</p>
        <button className={styles.outlineButton} type="button">How We Analyze Bias</button>
      </section>

      <section className={styles.analysisCard} aria-labelledby="ai-summary-heading">
        <PanelHeading id="ai-summary-heading">AI Summary</PanelHeading>
        <p className={styles.generatedMeta}>
          Generated <time dateTime={article.analysis.generatedAt}>{formatDate(article.analysis.generatedAt)}</time>
        </p>
        <p className={styles.summaryText}>{article.analysis.summary}</p>
        <div className={styles.analysisDetails}>
          <div className={styles.detailRow}>
            <span>Sentiment</span>
            <strong>{capitalize(article.analysis.sentimentLabel)} ({article.analysis.sentimentScore.toFixed(2)})</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Bias score</span>
            <strong>{article.analysis.biasScore.toFixed(2)}</strong>
          </div>
          <div>
            <h3>Framing notes</h3>
            <p>{article.analysis.framingNotes}</p>
          </div>
          <div>
            <h3>Loaded terms</h3>
            {article.analysis.loadedTerms.length > 0 ? (
              <ul className={styles.termList} aria-label="Loaded terms">
                {article.analysis.loadedTerms.map((term) => <li key={term}>{term}</li>)}
              </ul>
            ) : (
              <p className={styles.emptyTerms}>None detected.</p>
            )}
          </div>
          <p className={styles.modelLabel}>Model: {article.analysis.model}</p>
        </div>
        <p className={styles.disclaimer}>{article.analysis.disclaimer}</p>
        <p className={styles.mistakes}>AI summaries can make mistakes.</p>
        <button className={`${styles.outlineButton} ${styles.compactButton}`} type="button">Provide Feedback</button>
      </section>

      <section className={styles.analysisCard} aria-labelledby="article-source-heading">
        <PanelHeading id="article-source-heading">Article Source</PanelHeading>
        <div className={styles.sourceCard}>
          <strong>{article.source.name}</strong>
          <span>Published {formatDate(article.publishedAt)}</span>
          <a
            className={styles.sourceLink}
            href={article.canonicalUrl || article.originalUrl}
            rel="noreferrer"
            target="_blank"
          >
            Read original article
          </a>
        </div>
      </section>
    </aside>
  );
}

function PanelHeading({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <div className={styles.panelHeading}>
      <h2 id={id}>{children}</h2>
      <Icon name="info" size={16} />
    </div>
  );
}

function MeterRow({ label, value }: MeterRowProps) {
  const labelClass = styles[`meterValue${label}`];

  return (
    <div className={styles.meterRow}>
      <span>{label}</span>
      <strong className={labelClass}>{value}%</strong>
      <span className={styles.miniTrack} aria-hidden="true">
        <span className={styles[`miniFill${label}`]} style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getFramingPercentage(article: ArticleDetail) {
  switch (article.analysis.biasLabel) {
    case "left":
      return article.analysis.leftPercentage;
    case "center":
      return article.analysis.centerPercentage;
    case "right":
      return article.analysis.rightPercentage;
    default:
      return Math.max(
        article.analysis.leftPercentage,
        article.analysis.centerPercentage,
        article.analysis.rightPercentage,
      );
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}
