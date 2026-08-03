import { Chip } from "@/components/design-system/primitives";
import styles from "./home.module.css";

const categories = [
  "World Cup",
  "IPL",
  "Social Media",
  "Business & Markets",
  "Health & Medicine",
  "Soccer",
  "Artificial Intelligence",
  "Arsenal FC",
  "Extreme Weather and Disasters",
] as const;

export function CategoryRail() {
  return (
    <nav className={styles.categoryRail} aria-label="News categories">
      <div className={`${styles.shell} ${styles.categoryScroller}`} tabIndex={0}>
        <button className={styles.addCategoryButton} type="button" aria-label="Add a news category">
          <span aria-hidden="true">+</span>
        </button>
        {categories.map((category) => <Chip key={category} label={category} />)}
      </div>
    </nav>
  );
}
