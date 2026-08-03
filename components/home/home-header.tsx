import Link from "next/link";
import { BrandMark } from "@/components/design-system/primitives";
import { Icon } from "@/components/design-system/icons";
import styles from "./home.module.css";

const navItems = ["For You", "Local", "Blindspot"] as const;

export function HomeHeader() {
  return (
    <header>
      <div className={styles.utilityBar}>
        <div className={`${styles.shell} ${styles.utilityInner}`}>
          <div className={styles.utilityGroup}>
            <button className={styles.utilityAction} type="button">Browser Extension</button>
            <span className={styles.utilityDivider} aria-hidden="true" />
            <span className={styles.utilityLabel}>Theme:</span>
            <button className={styles.utilityChoiceActive} type="button" aria-pressed="true">Light</button>
            <button className={styles.utilityChoice} type="button" aria-pressed="false">Dark</button>
            <button className={styles.utilityChoice} type="button" aria-pressed="false">Auto</button>
          </div>
          <div className={`${styles.utilityGroup} ${styles.utilityRight}`}>
            <time dateTime="2026-06-01">Monday, June 1, 2026</time>
            <span className={styles.utilityDivider} aria-hidden="true" />
            <button className={styles.utilityAction} type="button">Set Location</button>
            <button className={styles.editionButton} type="button">
              <Icon name="globe" size={13} />
              <span>International Edition</span>
              <Icon name="chevron-down" size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.primaryBar}>
        <div className={`${styles.shell} ${styles.primaryInner}`}>
          <button className={styles.menuButton} type="button" aria-label="Open main menu">
            <Icon name="menu" size={22} />
          </button>
          <Link className={styles.brandLink} href="/" aria-label="Biasly home">
            <BrandMark compact />
          </Link>
          <nav className={styles.primaryNav} aria-label="Primary navigation">
            <Link className={styles.activeNavItem} href="#top-news" aria-current="page">Home</Link>
            {navItems.map((item) => (
              <button className={styles.navItem} type="button" key={item}>
                {item}
                {item === "For You" ? <span className={styles.notificationDot} aria-label="New items" /> : null}
              </button>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <button className={styles.subscribeButton} type="button">Subscribe</button>
            <button className={styles.loginButton} type="button">Login</button>
          </div>
        </div>
      </div>
    </header>
  );
}
