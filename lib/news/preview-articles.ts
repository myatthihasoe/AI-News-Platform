export type FramingLabel = "left" | "center" | "right" | "mixed" | "unclear";
export type SentimentLabel = "positive" | "neutral" | "negative";

export type HomeArticle = {
  id: string;
  href?: string;
  category: string;
  region: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  left: number;
  center: number;
  right: number;
  sourceCount: number;
};

export type RelatedStory = {
  id: string;
  category: string;
  region: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  publishedAt: string;
  publishedLabel: string;
  readTime: string;
};

export type SourceBreakdownItem = {
  name: string;
  framing: "left" | "center" | "right";
};

export type NewsArticleDetail = HomeArticle & {
  slug: string;
  author: string;
  publishedAt: string;
  publishedLabel: string;
  readTime: string;
  imageCaption: string;
  imageCredit: string;
  body: readonly string[];
  analysis: {
    summary: string;
    summaryPoints: readonly string[];
    sentimentScore: number;
    sentimentLabel: SentimentLabel;
    framingLabel: FramingLabel;
    confidence: number;
    framingNotes: string;
    loadedTerms: readonly string[];
    disclaimer: string;
    model: string;
    generatedAt: string;
    generatedLabel: string;
    readTime: string;
  };
  sourceBreakdown: {
    leftCount: number;
    centerCount: number;
    rightCount: number;
    topSources: readonly SourceBreakdownItem[];
  };
  relatedStories: readonly RelatedStory[];
};

function assertFramingTotal(article: HomeArticle) {
  const total = article.left + article.center + article.right;

  if (total !== 100) {
    throw new Error(`Framing percentages for article ${article.id} must sum to 100.`);
  }

  return article;
}

const iranPeaceProposalCard = assertFramingTotal({
  id: "iran-peace-proposal",
  href: "/news/iran-peace-proposal",
  category: "Politics",
  region: "United States",
  title: "Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report",
  imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/P20260527DT-0550%20President%20Donald%20J.%20Trump%20holds%20a%20cabinet%20meeting.jpg?width=1600",
  imageAlt: "President Donald Trump seated at a White House cabinet meeting",
  left: 20,
  center: 31,
  right: 49,
  sourceCount: 12,
});

export const homeArticles: readonly HomeArticle[] = [
  iranPeaceProposalCard,
  assertFramingTotal({
    id: "grapes-superfood",
    category: "Health",
    region: "United States",
    title: "Researchers Make Case for Grapes as a ‘Superfood’ After Review of Health Evidence",
    imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Dark grapes ripening on a sunlit vine",
    left: 18,
    center: 42,
    right: 40,
    sourceCount: 7,
  }),
  assertFramingTotal({
    id: "cern-physics-hint",
    category: "Science",
    region: "Switzerland",
    title: "CERN Finds High-Significance Hint of Physics Beyond Standard Model",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Physics equations covering a dark chalkboard",
    left: 16,
    center: 62,
    right: 22,
    sourceCount: 8,
  }),
  assertFramingTotal({
    id: "brooklyn-rivera",
    category: "World",
    region: "Nicaragua",
    title: "Indigenous Leader Brooklyn Rivera Dies in Nicaragua After Nearly 3 Years of Detention",
    imageUrl: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "A public speaker addressing a gathered crowd",
    left: 54,
    center: 28,
    right: 18,
    sourceCount: 63,
  }),
  assertFramingTotal({
    id: "un-emergency-meeting",
    category: "World",
    region: "Middle East",
    title: "UN Security Council to Hold Emergency Meeting as Israel Pushes Deeper into Lebanon",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Damaged concrete buildings in a conflict-affected city",
    left: 22,
    center: 33,
    right: 45,
    sourceCount: 15,
  }),
  assertFramingTotal({
    id: "oil-prices",
    category: "Business",
    region: "Global",
    title: "Oil Prices Dip as OPEC+ Considers Output Increase Amid Weak Demand",
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Energy infrastructure stretching across an open landscape",
    left: 23,
    center: 50,
    right: 27,
    sourceCount: 11,
  }),
  assertFramingTotal({
    id: "starship-test-flight",
    category: "Technology",
    region: "United States",
    title: "SpaceX Launches Starship Test Flight in Milestone for Mars Program",
    imageUrl: "https://images.unsplash.com/photo-1517976547714-720226b864c1?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Rocket lifting off through clouds of exhaust",
    left: 12,
    center: 45,
    right: 43,
    sourceCount: 9,
  }),
  assertFramingTotal({
    id: "apple-ai-features",
    category: "Business",
    region: "United States",
    title: "Apple Unveils AI-Powered Features Across iPhone, iPad and Mac",
    imageUrl: "https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Apple logo displayed on a modern glass storefront",
    left: 15,
    center: 40,
    right: 45,
    sourceCount: 10,
  }),
  assertFramingTotal({
    id: "hottest-years",
    category: "Climate",
    region: "Global",
    title: "2025 on Track to Be Among Top 3 Hottest Years, EU Climate Service Says",
    imageUrl: "https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Thermometer in bright summer sunlight",
    left: 33,
    center: 34,
    right: 33,
    sourceCount: 14,
  }),
  assertFramingTotal({
    id: "fed-rates",
    category: "Economy",
    region: "United States",
    title: "Fed Holds Rates Steady, Signals Caution on Inflation and Growth Outlook",
    imageUrl: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Classical stone columns on a central bank building",
    left: 30,
    center: 44,
    right: 26,
    sourceCount: 13,
  }),
  assertFramingTotal({
    id: "real-madrid-final",
    category: "Soccer",
    region: "Europe",
    title: "Real Madrid Win Champions League After Comeback Victory in Final",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Professional soccer player celebrating in a stadium",
    left: 10,
    center: 20,
    right: 70,
    sourceCount: 26,
  }),
  assertFramingTotal({
    id: "western-canada-wildfires",
    category: "Environment",
    region: "Canada",
    title: "Wildfires Force Thousands to Evacuate Across Western Canada",
    imageUrl: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Firefighter facing an intense forest wildfire",
    left: 27,
    center: 33,
    right: 40,
    sourceCount: 17,
  }),
] as const;

const iranPeaceProposalDetail: NewsArticleDetail = {
  ...iranPeaceProposalCard,
  slug: "iran-peace-proposal",
  author: "David Morgan",
  publishedAt: "2026-05-31",
  publishedLabel: "May 31, 2026",
  readTime: "12 min read",
  imageCaption: "President Donald Trump during a Cabinet meeting at the White House in Washington, D.C., May 27, 2026.",
  imageCredit: "Official White House photo / Daniel Torok",
  body: [
    "The Trump administration has sent Iran a revised nuclear deal proposal that includes tougher terms on uranium enrichment and stronger verification measures, according to a report published Saturday.",
    "The new proposal, delivered through intermediaries in Oman, requires Iran to halt all uranium enrichment on its soil and ship its stockpile of enriched uranium out of the country. It also demands unrestricted access for international inspectors to all Iranian nuclear facilities, including military sites.",
    "“This is a take-it-or-leave-it proposal,” a senior administration official told The Wall Street Journal. “The President wants a deal, but he will not accept a weak agreement that puts America or our allies at risk.”",
    "Iran has not yet officially responded to the proposal. However, Iranian Foreign Minister Hossein Amir-Abdollahian said last week that any deal must respect Iran's right to peaceful nuclear energy and include the lifting of all U.S. sanctions.",
    "The revised proposal comes after several rounds of indirect talks between U.S. and Iranian officials failed to produce a breakthrough. The Trump administration has warned that if diplomacy fails, it is prepared to take other action to prevent Iran from obtaining a nuclear weapon.",
    "European allies have urged both sides to continue negotiations. “We believe diplomacy is still the best path forward,” said a spokesperson for the EU's foreign policy chief.",
    "Israel, which has long opposed the 2015 nuclear deal with Iran, praised the Trump administration's tougher stance. “This is the kind of leadership that was missing in the past,” said Israeli Prime Minister Benjamin Netanyahu in a statement.",
    "The fate of the proposal now rests with Iran, as global attention remains focused on whether a new nuclear agreement can be reached—or if tensions will escalate further.",
  ],
  analysis: {
    summary: "A revised U.S. proposal asks Iran to stop domestic enrichment, accept broader inspections, and move enriched stockpiles abroad while diplomatic pressure builds.",
    summaryPoints: [
      "The Trump administration has sent Iran a revised nuclear deal proposal with tougher terms, including a complete halt to uranium enrichment and the removal of enriched uranium stockpiles.",
      "The proposal also demands unrestricted inspector access to all nuclear sites, including military facilities.",
      "Iran has not responded officially but says any deal must protect its right to peaceful nuclear energy and include sanctions relief.",
      "The U.S. warns it is prepared to take other action if diplomacy fails, while European allies urge continued negotiations.",
      "Israel supports the tougher stance, praising the administration's determination to prevent Iran from acquiring nuclear weapons.",
    ],
    sentimentScore: -0.12,
    sentimentLabel: "neutral",
    framingLabel: "right",
    confidence: 0.78,
    framingNotes: "The article gives greater emphasis to the administration's security rationale and allied support while still including Iranian and European positions.",
    loadedTerms: ["take-it-or-leave-it", "weak agreement", "tougher stance"],
    disclaimer: "This analysis is generated by AI from the article text and should be treated as an estimate, not an objective determination of political bias.",
    model: "Biasly preview analysis",
    generatedAt: "2026-05-31",
    generatedLabel: "May 31, 2026",
    readTime: "3 min read",
  },
  sourceBreakdown: {
    leftCount: 2,
    centerCount: 4,
    rightCount: 6,
    topSources: [
      { name: "Fox News", framing: "right" },
      { name: "The Wall Street Journal", framing: "center" },
      { name: "Reuters", framing: "center" },
      { name: "BBC", framing: "center" },
      { name: "CNN", framing: "left" },
      { name: "The New York Times", framing: "center" },
      { name: "The Washington Post", framing: "center" },
      { name: "Newsmax", framing: "right" },
    ],
  },
  relatedStories: [
    {
      id: "iran-maximum-pressure",
      category: "World",
      region: "Middle East",
      title: "Iran Says It Will Not Negotiate Under ‘Maximum Pressure’",
      imageUrl: "https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=480&q=80",
      imageAlt: "Iranian flag waving outdoors",
      publishedAt: "2026-05-29",
      publishedLabel: "May 29, 2026",
      readTime: "8 min read",
    },
    {
      id: "bipartisan-iran-diplomacy",
      category: "Politics",
      region: "United States",
      title: "Bipartisan Group Urges Diplomacy With Iran",
      imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=480&q=80",
      imageAlt: "United States Capitol building beneath a pale sky",
      publishedAt: "2026-05-26",
      publishedLabel: "May 26, 2026",
      readTime: "5 min read",
    },
    {
      id: "iranian-entities-sanctions",
      category: "Politics",
      region: "United States",
      title: "US Sanctions More Iranian Entities Over Nuclear Program",
      imageUrl: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=480&q=80",
      imageAlt: "Stone columns on a government building",
      publishedAt: "2026-05-28",
      publishedLabel: "May 28, 2026",
      readTime: "6 min read",
    },
    {
      id: "2015-iran-nuclear-deal",
      category: "Science",
      region: "Nuclear Policy",
      title: "What's in the 2015 Iran Nuclear Deal?",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=480&q=80",
      imageAlt: "Scientific formulas written across a chalkboard",
      publishedAt: "2026-05-25",
      publishedLabel: "May 25, 2026",
      readTime: "10 min read",
    },
    {
      id: "oman-nuclear-talks",
      category: "World",
      region: "Middle East",
      title: "Oman Hosts Another Round of US–Iran Nuclear Talks",
      imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=480&q=80",
      imageAlt: "A city landscape in the Middle East",
      publishedAt: "2026-05-27",
      publishedLabel: "May 27, 2026",
      readTime: "7 min read",
    },
    {
      id: "israel-red-line",
      category: "World",
      region: "Middle East",
      title: "Israel Reaffirms Red Line Over Iranian Nuclear Program",
      imageUrl: "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=480&q=80",
      imageAlt: "A political leader speaking at a public event",
      publishedAt: "2026-05-24",
      publishedLabel: "May 24, 2026",
      readTime: "6 min read",
    },
  ],
};

const detailArticles = new Map<string, NewsArticleDetail>([
  [iranPeaceProposalDetail.slug, iranPeaceProposalDetail],
]);

export function getPreviewArticle(slug: string) {
  return detailArticles.get(slug);
}

export function getPreviewArticleSlugs() {
  return Array.from(detailArticles.keys());
}
