import { BrandMark } from "@/components/design-system/primitives";
import { Icon, type IconName } from "@/components/design-system/icons";
import styles from "./home.module.css";

type FooterLink = { label: string; href?: string };

const companyLinks: readonly FooterLink[] = [
  { label: "About" },
  { label: "Careers" },
  { label: "Press" },
  { label: "Contact" },
];
const helpLinks: readonly FooterLink[] = [
  { label: "Help Center" },
  { label: "Guides" },
  { label: "Privacy Policy" },
  { label: "Terms of Service" },
];
const socialLinks: ReadonlyArray<{ label: string; icon: IconName; href?: string }> = [
  { label: "X", icon: "x" },
  { label: "LinkedIn", icon: "linkedin" },
  { label: "Instagram", icon: "instagram" },
  { label: "YouTube", icon: "youtube" },
];

export function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.shell} ${styles.footerGrid}`}>
        <div className={styles.footerBrand}>
          <BrandMark inverse compact />
          <p>Balanced news coverage,<br />powered by AI.</p>
        </div>
        <FooterLinks title="Company" links={companyLinks} />
        <FooterLinks title="Help" links={helpLinks} />
        <div className={styles.footerColumn} id="connect">
          <h2>Connect</h2>
          <div className={styles.socialLinks}>
            {socialLinks.map((social) => (
              social.href ? (
                <a href={social.href} key={social.label} aria-label={`Biasly on ${social.label}`}>
                  <Icon name={social.icon} size={17} />
                </a>
              ) : (
                <span key={social.label} role="img" aria-label={`Biasly on ${social.label}`}>
                  <Icon name={social.icon} size={17} />
                </span>
              )
            ))}
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <div className={styles.shell}>© 2026 Biasly News. All rights reserved.</div>
      </div>
    </footer>
  );
}

type FooterLinksProps = {
  title: string;
  links: readonly FooterLink[];
};

function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <div className={styles.footerColumn}>
      <h2>{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.label}>
            {link.href ? <a href={link.href}>{link.label}</a> : <span>{link.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
