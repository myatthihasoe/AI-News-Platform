import { Icon } from "@/components/design-system/icons";
import type { NewsArticleDetail } from "@/lib/news/preview-articles";
import styles from "./news-details.module.css";

type AnalysisSidebarProps = {
  article: NewsArticleDetail;
};

type MeterRowProps = {
  label: "Left" | "Center" | "Right";
  value: number;
  count?: number;
};

export function AnalysisSidebar({ article }: AnalysisSidebarProps) {
  const confidence = Math.round(article.analysis.confidence * 100);

  return (
    <aside className={styles.sidebar} aria-label="AI article analysis">
      <section className={styles.analysisCard} aria-labelledby="bias-analysis-heading">
        <PanelHeading id="bias-analysis-heading">Bias Analysis</PanelHeading>
        <p className={styles.overline}>AI-estimated overall framing</p>
        <p className={styles.overallBias}>{capitalize(article.analysis.framingLabel)} {article.right}%</p>
        <p className={styles.basedOn}>Based on {article.sourceCount} balanced sources</p>
        <div className={styles.analysisDivider} />
        <div className={styles.meterRows}>
          <MeterRow label="Left" value={article.left} />
          <MeterRow label="Center" value={article.center} />
          <MeterRow label="Right" value={article.right} />
        </div>
        <p className={styles.confidence}><strong>{confidence}% confidence</strong> in this AI estimate</p>
        <p className={styles.explainer}>Our analysis compares the political framing of the story across publications. Sources are weighted by reliability and recency.</p>
        <button className={styles.outlineButton} type="button">How We Analyze Bias</button>
      </section>

      <section className={styles.analysisCard} aria-labelledby="ai-summary-heading">
        <PanelHeading id="ai-summary-heading">AI Summary</PanelHeading>
        <p className={styles.generatedMeta}>
          Generated <time dateTime={article.analysis.generatedAt}>{article.analysis.generatedLabel}</time>
          <span aria-hidden="true"> · </span>{article.analysis.readTime}
        </p>
        <ul className={styles.summaryList}>
          {article.analysis.summaryPoints.map((point) => <li key={point}>{point}</li>)}
        </ul>
        <div className={styles.analysisDetails}>
          <div className={styles.detailRow}>
            <span>Sentiment</span>
            <strong>{capitalize(article.analysis.sentimentLabel)} ({article.analysis.sentimentScore.toFixed(2)})</strong>
          </div>
          <div>
            <h3>Framing notes</h3>
            <p>{article.analysis.framingNotes}</p>
          </div>
          <div>
            <h3>Loaded terms</h3>
            <ul className={styles.termList} aria-label="Loaded terms">
              {article.analysis.loadedTerms.map((term) => <li key={term}>{term}</li>)}
            </ul>
          </div>
          <p className={styles.modelLabel}>Model: {article.analysis.model}</p>
        </div>
        <p className={styles.disclaimer}>{article.analysis.disclaimer}</p>
        <p className={styles.mistakes}>AI summaries can make mistakes.</p>
        <button className={`${styles.outlineButton} ${styles.compactButton}`} type="button">Provide Feedback</button>
      </section>

      <section className={styles.analysisCard} aria-labelledby="source-breakdown-heading">
        <PanelHeading id="source-breakdown-heading">Source Breakdown</PanelHeading>
        <p className={styles.totalSources}>{article.sourceCount} Total Sources</p>
        <div className={`${styles.meterRows} ${styles.sourceMeters}`}>
          <MeterRow label="Left" value={article.left} count={article.sourceBreakdown.leftCount} />
          <MeterRow label="Center" value={article.center} count={article.sourceBreakdown.centerCount} />
          <MeterRow label="Right" value={article.right} count={article.sourceBreakdown.rightCount} />
        </div>
        <div className={styles.sourceListHeading} aria-hidden="true">
          <span>Top Sources</span><span>Bias</span>
        </div>
        <ul className={styles.sourceList}>
          {article.sourceBreakdown.topSources.map((source) => (
            <li key={source.name}>
              <span>{source.name}</span>
              <span className={styles[`framing${capitalize(source.framing)}`]}>{capitalize(source.framing)}</span>
            </li>
          ))}
        </ul>
        <button className={styles.outlineButton} type="button">View All Sources</button>
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

function MeterRow({ label, value, count }: MeterRowProps) {
  const labelClass = styles[`meterValue${label}`];

  return (
    <div className={styles.meterRow}>
      <span>{label}</span>
      <strong className={labelClass}>{count === undefined ? `${value}%` : `${count} (${value}%)`}</strong>
      <span className={styles.miniTrack} aria-hidden="true">
        <span className={styles[`miniFill${label}`]} style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
