import { Icon } from "./icons";
import styles from "./design-system.module.css";

type BrandMarkProps = {
  inverse?: boolean;
  compact?: boolean;
};

export function BrandMark({ inverse = false, compact = false }: BrandMarkProps) {
  return (
    <div
      className={`${styles.brandMark} ${inverse ? styles.brandInverse : ""} ${compact ? styles.brandCompact : ""}`}
      aria-label="Biasly News"
    >
      <span className={styles.brandWord}>biasly</span>
      <span className={styles.brandNews}>News</span>
    </div>
  );
}

type PanelProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function Panel({ title, children, className = "", compact = false }: PanelProps) {
  return (
    <section className={`${styles.panel} ${compact ? styles.panelCompact : ""} ${className}`}>
      <h2 className={styles.panelTitle}>{title}</h2>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

type ButtonVariant = "primary" | "secondary" | "text";
type ButtonDemoState = "default" | "hover" | "outline";

type ButtonProps = {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  demoState?: ButtonDemoState;
  disabled?: boolean;
  ariaLabel?: string;
};

export function Button({
  children = "Button",
  variant = "primary",
  demoState = "default",
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${styles.button} ${styles[`button${capitalize(variant)}`]} ${styles[`state${capitalize(demoState)}`]}`}
    >
      {children}
    </button>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type ChipProps = {
  label: string;
};

export function Chip({ label }: ChipProps) {
  return (
    <button className={styles.chip} type="button">
      <span>{label}</span>
      <span aria-hidden="true" className={styles.chipPlus}>+</span>
    </button>
  );
}

export type BiasBreakdown = {
  left: number;
  center: number;
  right: number;
};

type BiasMeterProps = BiasBreakdown & {
  compact?: boolean;
  showScale?: boolean;
};

export function BiasMeter({ left, center, right, compact = false, showScale = true }: BiasMeterProps) {
  const total = left + center + right || 1;
  const summary = `AI-estimated political framing: ${left}% left, ${center}% center, ${right}% right.`;

  return (
    <div className={`${styles.meter} ${compact ? styles.meterCompact : ""}`}>
      <span className={styles.srOnly}>{summary}</span>
      <div className={styles.meterTrack} aria-hidden="true">
        <span className={styles.meterLeft} style={{ flexGrow: left / total }}>
          Left {left}%
        </span>
        <span className={styles.meterCenter} style={{ flexGrow: center / total }}>
          Center {center}%
        </span>
        <span className={styles.meterRight} style={{ flexGrow: right / total }}>
          Right {right}%
        </span>
      </div>
      {showScale ? (
        <div className={styles.meterScale} aria-hidden="true">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      ) : null}
    </div>
  );
}

export type NewsCardProps = {
  category: string;
  location: string;
  title: string;
  summary: string;
  publishedAt: string;
  publishedLabel: string;
  readTime: string;
  bias: BiasBreakdown;
};

export function NewsCard({
  category,
  location,
  title,
  summary,
  publishedAt,
  publishedLabel,
  readTime,
  bias,
}: NewsCardProps) {
  return (
    <article className={styles.newsCard}>
      <div className={styles.newsMedia} role="img" aria-label="Editorial illustration of a world leader at a press briefing">
        <span className={styles.flagStripe} aria-hidden="true" />
        <span className={styles.portrait} aria-hidden="true" />
        <span className={styles.suit} aria-hidden="true" />
        <span className={styles.infoBadge}><Icon name="info" size={16} /></span>
      </div>
      <div className={styles.newsContent}>
        <p className={styles.eyebrow}>{category}<span aria-hidden="true"> · </span>{location}</p>
        <h3 className={styles.newsTitle}>{title}</h3>
        <p className={styles.newsSummary}>{summary}</p>
        <BiasMeter {...bias} compact showScale={false} />
        <div className={styles.newsMeta}>
          <span><Icon name="clock" size={16} /><time dateTime={publishedAt}>{publishedLabel}</time></span>
          <span><Icon name="bookmark" size={16} />{readTime}</span>
        </div>
      </div>
    </article>
  );
}
