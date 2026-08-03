import Image from "next/image";
import type { RelatedStory } from "@/lib/news/preview-articles";
import styles from "./news-details.module.css";

type RelatedStoryCardProps = {
  story: RelatedStory;
};

export function RelatedStoryCard({ story }: RelatedStoryCardProps) {
  return (
    <article className={styles.relatedCard}>
      <div className={styles.relatedMedia}>
        <Image
          alt={story.imageAlt}
          className={styles.relatedImage}
          fill
          sizes="(max-width: 520px) 96px, 120px"
          src={story.imageUrl}
        />
      </div>
      <div className={styles.relatedContent}>
        <p>{story.category}<span aria-hidden="true"> · </span>{story.region}</p>
        <h3>{story.title}</h3>
        <div>
          <time dateTime={story.publishedAt}>{story.publishedLabel}</time>
          <span aria-hidden="true"> · </span>{story.readTime}
        </div>
      </div>
    </article>
  );
}
