import { BrandMark } from "@/components/design-system/primitives";
import { Icon, type IconName } from "@/components/design-system/icons";
import styles from "./home.module.css";

const companyLinks = ["About", "Careers", "Press", "Contact"] as const;
const helpLinks = ["Help Center", "Guides", "Privacy Policy", "Terms of Service"] as const;
const socialLinks: Array<{ label: string; icon: IconName }> = [
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
              <a href="#top-news" key={social.label} aria-label={`Biasly on ${social.label}`}>
                <Icon name={social.icon} size={17} />
              </a>
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
  links: readonly string[];
};

function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <div className={styles.footerColumn}>
      <h2>{title}</h2>
      <ul>
        {links.map((link) => <li key={link}><a href="#top-news">{link}</a></li>)}
      </ul>
    </div>
  );
}
