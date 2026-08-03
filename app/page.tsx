import type { Metadata } from "next";
import { CategoryRail } from "@/components/home/category-rail";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { HomeNewsCard, type HomeArticle } from "@/components/home/home-news-card";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Biasly" },
  description: "Balanced news coverage with AI-estimated sentiment and political framing insights.",
};

const articles: HomeArticle[] = [
  {
    id: "iran-peace-proposal",
    category: "Politics",
    region: "United States",
    title: "Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report",
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "United States government building under a dramatic sky",
    left: 20, center: 31, right: 49, sourceCount: 12,
  },
  {
    id: "grapes-superfood",
    category: "Health",
    region: "United States",
    title: "Researchers Make Case for Grapes as a ‘Superfood’ After Review of Health Evidence",
    imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Dark grapes ripening on a sunlit vine",
    left: 18, center: 42, right: 40, sourceCount: 7,
  },
  {
    id: "cern-physics-hint",
    category: "Science",
    region: "Switzerland",
    title: "CERN Finds High-Significance Hint of Physics Beyond Standard Model",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Physics equations covering a dark chalkboard",
    left: 16, center: 62, right: 22, sourceCount: 8,
  },
  {
    id: "brooklyn-rivera",
    category: "World",
    region: "Nicaragua",
    title: "Indigenous Leader Brooklyn Rivera Dies in Nicaragua After Nearly 3 Years of Detention",
    imageUrl: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "A public speaker addressing a gathered crowd",
    left: 54, center: 28, right: 18, sourceCount: 63,
  },
  {
    id: "un-emergency-meeting",
    category: "World",
    region: "Middle East",
    title: "UN Security Council to Hold Emergency Meeting as Israel Pushes Deeper into Lebanon",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Damaged concrete buildings in a conflict-affected city",
    left: 22, center: 33, right: 45, sourceCount: 15,
  },
  {
    id: "oil-prices",
    category: "Business",
    region: "Global",
    title: "Oil Prices Dip as OPEC+ Considers Output Increase Amid Weak Demand",
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Energy infrastructure stretching across an open landscape",
    left: 23, center: 50, right: 27, sourceCount: 11,
  },
  {
    id: "starship-test-flight",
    category: "Technology",
    region: "United States",
    title: "SpaceX Launches Starship Test Flight in Milestone for Mars Program",
    imageUrl: "https://images.unsplash.com/photo-1517976547714-720226b864c1?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Rocket lifting off through clouds of exhaust",
    left: 12, center: 45, right: 43, sourceCount: 9,
  },
  {
    id: "apple-ai-features",
    category: "Business",
    region: "United States",
    title: "Apple Unveils AI-Powered Features Across iPhone, iPad and Mac",
    imageUrl: "https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Apple logo displayed on a modern glass storefront",
    left: 15, center: 40, right: 45, sourceCount: 10,
  },
  {
    id: "hottest-years",
    category: "Climate",
    region: "Global",
    title: "2025 on Track to Be Among Top 3 Hottest Years, EU Climate Service Says",
    imageUrl: "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Thermometer in bright summer sunlight",
    left: 33, center: 34, right: 33, sourceCount: 14,
  },
  {
    id: "fed-rates",
    category: "Economy",
    region: "United States",
    title: "Fed Holds Rates Steady, Signals Caution on Inflation and Growth Outlook",
    imageUrl: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Classical stone columns on a central bank building",
    left: 30, center: 44, right: 26, sourceCount: 13,
  },
  {
    id: "real-madrid-final",
    category: "Soccer",
    region: "Europe",
    title: "Real Madrid Win Champions League After Comeback Victory in Final",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Professional soccer player celebrating in a stadium",
    left: 10, center: 20, right: 70, sourceCount: 26,
  },
  {
    id: "western-canada-wildfires",
    category: "Environment",
    region: "Canada",
    title: "Wildfires Force Thousands to Evacuate Across Western Canada",
    imageUrl: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Firefighter facing an intense forest wildfire",
    left: 27, center: 33, right: 40, sourceCount: 17,
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <HomeHeader />
      <CategoryRail />
      <main className={styles.main}>
        <section aria-labelledby="top-news">
          <h1 id="top-news" className={styles.heading}>Top News</h1>
          <div className={styles.newsGrid}>
            {articles.map((article) => <HomeNewsCard article={article} key={article.id} />)}
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
