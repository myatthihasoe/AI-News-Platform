import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/design-system/icons";
import {
  BiasMeter,
  BrandMark,
  Button,
  Chip,
  NewsCard,
  Panel,
} from "@/components/design-system/primitives";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Design System",
  description: "The visual language for balanced news coverage, powered by AI.",
};

const colors = [
  { group: "Primary", items: [
    { name: "Text Primary", value: "#0D0D0F", color: "#0d0d0f", dark: true },
    { name: "Text Secondary", value: "#6B7280", color: "#6b7280", dark: true },
    { name: "Surface", value: "#F6F6F6", color: "#f6f6f6" },
  ] },
  { group: "Semantic", items: [
    { name: "Left Bias", value: "#B42318", color: "#b42318", dark: true },
    { name: "Center", value: "#E5E7EB", color: "#e5e7eb" },
    { name: "Right Bias", value: "#1D4ED8", color: "#1d4ed8", dark: true },
  ] },
  { group: "Neutrals", items: [
    { name: "BG Primary", value: "#FFFFFF", color: "#ffffff" },
    { name: "BG Secondary", value: "#F0F0F0", color: "#f0f0f0" },
    { name: "Border", value: "#E5E7EB", color: "#e5e7eb" },
    { name: "Divider", value: "#E5E7EB", color: "#e5e7eb" },
  ] },
] as const;

const typeRows = [
  { token: "H1", purpose: "Page / Screen Title", size: "32px", weight: "Bold", leading: "1.2", className: styles.typeH1 },
  { token: "H2", purpose: "Section Title", size: "24px", weight: "SemiBold", leading: "1.3", className: styles.typeH2 },
  { token: "H3", purpose: "Card / Module Title", size: "20px", weight: "SemiBold", leading: "1.3", className: styles.typeH3 },
  { token: "H4", purpose: "Subheading", size: "16px", weight: "Medium", leading: "1.4", className: styles.typeH4 },
  { token: "Body Large", purpose: "Important content", size: "16px", weight: "Regular", leading: "1.6", className: styles.bodyLarge },
  { token: "Body Medium", purpose: "Body text", size: "14px", weight: "Regular", leading: "1.6", className: styles.bodyMedium },
  { token: "Body Small", purpose: "Supporting text", size: "13px", weight: "Regular", leading: "1.6", className: styles.bodySmall },
  { token: "Caption", purpose: "Labels, meta text", size: "11px", weight: "Regular", leading: "1.4", className: styles.caption },
] as const;

const iconNames: IconName[] = [
  "menu", "search", "bookmark", "clock", "info",
  "share", "external", "calendar", "analytics", "tag",
  "user", "bell", "sliders", "check", "more",
];

const spacingValues = [4, 8, 16, 24, 32, 40, 64] as const;

const newsCard = {
  category: "Politics",
  location: "United States",
  title: "Leaders Signal Revised Peace Proposal With Tougher Terms",
  summary: "The proposal includes stricter limits and enhanced verification measures, presented with clear context and balanced framing.",
  publishedAt: "2026-06-01T10:00:00Z",
  publishedLabel: "2h ago",
  readTime: "12 min read",
  bias: { left: 25, center: 50, right: 25 },
} as const;

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.board}>
        <Panel title="Brand" className={styles.brandPanel}>
          <div className={styles.brandContent}>
            <BrandMark />
            <p>Balanced news coverage,<br />powered by AI.</p>
          </div>
        </Panel>

        <Panel title="Colors" className={styles.colorsPanel}>
          <div className={styles.colorGroups}>
            {colors.map((group) => (
              <div key={group.group}>
                <h3 className={styles.groupLabel}>{group.group}</h3>
                <div className={styles.swatchGrid}>
                  {group.items.map((item) => (
                    <div className={styles.swatchItem} key={item.name}>
                      <span
                        className={`${styles.swatch} ${"dark" in item && item.dark ? styles.swatchDark : ""}`}
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <strong>{item.name}</strong>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Typography" className={styles.typographyPanel}>
          <div className={styles.typographyLayout}>
            <div className={styles.fontIntro}>
              <span className={styles.groupLabel}>Font Family</span>
              <strong>Poppins</strong>
              <p>Poppins is a modern geometric sans-serif typeface that ensures clarity and excellent readability.</p>
            </div>
            <div className={styles.typeTable} role="table" aria-label="Typography scale">
              <div className={styles.typeHeader} role="row">
                <span>Style</span><span>Use</span><span>Size</span><span>Weight</span><span>Line height</span>
              </div>
              {typeRows.map((row) => (
                <div className={styles.typeRow} role="row" key={row.token}>
                  <strong className={row.className}>{row.token}</strong>
                  <span>{row.purpose}</span>
                  <span>{row.size}</span>
                  <span>{row.weight}</span>
                  <span>{row.leading}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="UI Elements" className={styles.uiPanel}>
          <div className={styles.uiSection}>
            <h3 className={styles.groupLabel}>Buttons</h3>
            <div className={styles.buttonMatrix}>
              <span /><span>Default</span><span>Hover</span><span>Outline</span><span>Disabled</span>
              <strong>Primary</strong>
              <Button /><Button demoState="hover" /><Button demoState="outline" /><Button disabled />
              <strong>Secondary</strong>
              <Button variant="secondary" /><Button variant="secondary" demoState="hover" /><Button variant="secondary" demoState="outline" /><Button variant="secondary" disabled />
              <strong>Text</strong>
              <Button variant="text" /><Button variant="text" demoState="hover" /><span className={styles.matrixDash}>—</span><span className={styles.matrixDash}>—</span>
            </div>
          </div>
          <div className={styles.uiSection}>
            <h3 className={styles.groupLabel}>Chip / Category</h3>
            <div className={styles.chipRow}>
              {['World Cup', 'IPL', 'Business & Markets', 'More'].map((label) => <Chip key={label} label={label} />)}
            </div>
          </div>
          <div className={styles.uiSection}>
            <h3 className={styles.groupLabel}>Bias Meter</h3>
            <BiasMeter left={25} center={50} right={25} />
          </div>
        </Panel>

        <Panel title="Icons" className={styles.iconsPanel}>
          <div className={styles.iconGrid}>
            {iconNames.map((name) => (
              <div className={styles.iconSample} key={name} title={name}>
                <Icon name={name} />
                <span className={styles.visuallyHidden}>{name}</span>
              </div>
            ))}
          </div>
          <p className={styles.iconNote}>Line style <span>·</span> 2px stroke <span>·</span> Rounded caps</p>
        </Panel>

        <Panel title="Card Example" className={styles.cardPanel}>
          <NewsCard {...newsCard} />
        </Panel>

        <Panel title="Spacing System" className={styles.spacingPanel}>
          <div className={styles.spacingHeader}><span>(4px base unit)</span></div>
          <div className={styles.spacingScale}>
            {spacingValues.map((value) => (
              <div className={styles.spacingItem} key={value}>
                <span className={styles.spacingBar} style={{ height: `${Math.max(10, value)}px`, width: `${Math.max(10, value)}px` }} />
                <strong>{value}px</strong>
              </div>
            ))}
          </div>
          <p className={styles.systemNote}>Consistent spacing scale based on 4px base unit</p>
        </Panel>

        <Panel title="Grid System" className={styles.gridPanel}>
          <div className={styles.gridSpecimen}>
            <div className={styles.gridColumns} aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
            </div>
            <dl className={styles.gridLegend}>
              <div><dt>Container</dt><dd>1280px</dd></div>
              <div><dt>Columns</dt><dd>12</dd></div>
              <div><dt>Gutter</dt><dd>24px</dd></div>
              <div><dt>Margin</dt><dd>24px</dd></div>
            </dl>
          </div>
        </Panel>

        <div className={styles.utilities}>
          <Panel title="Shadows" compact>
            <div className={styles.shadowList}>
              <TokenSample name="Small" value="0px 1px 2px rgba(0,0,0,0.05)" className={styles.shadowSmall} />
              <TokenSample name="Medium" value="0px 4px 12px rgba(0,0,0,0.08)" className={styles.shadowMedium} />
              <TokenSample name="Large" value="0px 12px 24px rgba(0,0,0,0.12)" className={styles.shadowLarge} />
            </div>
          </Panel>
          <Panel title="Border Radius" compact>
            <div className={styles.radiusList}>
              <TokenSample name="Small" value="4px" className={styles.radiusSmall} />
              <TokenSample name="Medium" value="8px" className={styles.radiusMedium} />
              <TokenSample name="Large" value="12px" className={styles.radiusLarge} />
              <TokenSample name="Full" value="9999px" className={styles.radiusFull} />
            </div>
          </Panel>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <BrandMark inverse compact />
          <p>Balanced news coverage,<br />powered by AI.</p>
        </div>
        <span>Design System v1.0</span>
        <time dateTime="2026-06-01">June 1, 2026</time>
        <p>Stay consistent. Stay unbiased.</p>
      </footer>
    </main>
  );
}

type TokenSampleProps = {
  name: string;
  value: string;
  className: string;
};

function TokenSample({ name, value, className }: TokenSampleProps) {
  return (
    <div className={styles.tokenSample}>
      <span className={`${styles.tokenShape} ${className}`} aria-hidden="true" />
      <div><strong>{name}</strong><span>{value}</span></div>
    </div>
  );
}
