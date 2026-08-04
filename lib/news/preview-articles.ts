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

function assertFramingTotal(article: HomeArticle): HomeArticle {
  const total = article.left + article.center + article.right;

  if (total !== 100) {
    throw new Error(`Framing percentages for article ${article.id} must sum to 100.`);
  }

  return {
    ...article,
    href: article.href ?? `/news/${article.id}`,
  };
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

type PreviewDetailCopy = {
  author: string;
  publishedAt: string;
  publishedLabel: string;
  readTime: string;
  imageCaption: string;
  imageCredit: string;
  body: readonly string[];
  summary: string;
  summaryPoints: readonly string[];
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  framingLabel: FramingLabel;
  confidence: number;
  framingNotes: string;
  loadedTerms: readonly string[];
  topSources: readonly SourceBreakdownItem[];
};

const additionalDetailCopy: Readonly<Record<string, PreviewDetailCopy>> = {
  "grapes-superfood": {
    author: "Maya Chen",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "8 min read",
    imageCaption: "Dark grapes growing on a sunlit vine ahead of harvest.",
    imageCredit: "Unsplash preview image",
    body: [
      "A new review of nutrition research argues that grapes deserve more attention as a whole food because they combine fiber, vitamins, and a broad range of plant compounds in a widely available fruit.",
      "The researchers examined laboratory studies, clinical trials, and observational data involving cardiovascular health, metabolism, and the gut microbiome. Several studies associated regular grape consumption with modest improvements in blood-vessel function and markers of oxidative stress.",
      "The authors cautioned that the evidence is not uniform. Many trials were small or short, and some tested concentrated grape products rather than ordinary servings of fresh fruit, making it difficult to compare results directly.",
      "Independent dietitians said the findings support including grapes in a varied diet but do not justify treating any single food as a cure. They emphasized overall eating patterns, portion size, and access to a range of fruits and vegetables.",
      "The review calls for larger controlled studies that use consistent serving sizes and follow participants for longer periods. Until then, the researchers describe grapes as a useful food with promising evidence rather than a medical treatment.",
    ],
    summary: "A research review links compounds in grapes with possible cardiovascular and metabolic benefits while stressing that larger, longer clinical trials are still needed.",
    summaryPoints: [
      "The review combines findings from laboratory research, clinical trials, and population studies.",
      "Grape consumption was associated with modest improvements in vascular function and oxidative-stress markers in some studies.",
      "Small samples, short trials, and the use of concentrated products limit the strength of the conclusions.",
      "Dietitians say grapes can support a balanced diet but should not be presented as a cure-all food.",
    ],
    sentimentScore: 0.18,
    sentimentLabel: "positive",
    framingLabel: "center",
    confidence: 0.71,
    framingNotes: "The coverage highlights potential health benefits but repeatedly includes study limitations and independent dietary context.",
    loadedTerms: ["superfood", "protective compounds", "promising evidence"],
    topSources: [
      { name: "Reuters", framing: "center" },
      { name: "Associated Press", framing: "center" },
      { name: "STAT", framing: "center" },
      { name: "CNN", framing: "left" },
      { name: "Fox News", framing: "right" },
    ],
  },
  "cern-physics-hint": {
    author: "Elena Rossi",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "10 min read",
    imageCaption: "Physics formulas illustrate the models researchers use to test particle behavior.",
    imageCredit: "Unsplash preview image",
    body: [
      "Physicists working with data from CERN have reported an unusually strong deviation in a rare particle-decay measurement, raising the possibility that an unknown process may sit beyond the Standard Model.",
      "The result crossed an important statistical threshold in the experiment's current dataset. Researchers said that makes the signal difficult to dismiss as a random fluctuation, but it does not yet establish the discovery of a new particle or force.",
      "Teams are checking detector calibration, background estimates, and alternative theoretical explanations. Independent measurements from other experiments will be essential because a systematic error can imitate the pattern the researchers observed.",
      "If the effect holds, it could help explain phenomena the Standard Model does not fully address, including dark matter and the imbalance between matter and antimatter. The measurement alone does not identify which proposed theory would be correct.",
      "CERN scientists expect the next data-taking period to substantially increase the sample size. They described the finding as a high-priority lead and urged caution until the result can be reproduced.",
    ],
    summary: "CERN researchers found a statistically strong anomaly in a rare particle decay, but confirmation and independent replication are required before it can be called new physics.",
    summaryPoints: [
      "A rare particle-decay measurement deviated from the Standard Model prediction.",
      "The signal reached a high statistical threshold but is not yet a confirmed discovery.",
      "Researchers are checking calibration, background estimates, and competing explanations.",
      "More CERN data and independent experiments will determine whether the anomaly persists.",
    ],
    sentimentScore: 0.08,
    sentimentLabel: "neutral",
    framingLabel: "center",
    confidence: 0.82,
    framingNotes: "The report balances the scientific significance of the anomaly with repeated cautions about replication and systematic uncertainty.",
    loadedTerms: ["high-significance", "new physics", "breakthrough"],
    topSources: [
      { name: "Nature", framing: "center" },
      { name: "Reuters", framing: "center" },
      { name: "BBC", framing: "center" },
      { name: "Associated Press", framing: "center" },
      { name: "CNN", framing: "left" },
      { name: "Fox News", framing: "right" },
    ],
  },
  "brooklyn-rivera": {
    author: "Miguel Alvarez",
    publishedAt: "2026-05-31",
    publishedLabel: "May 31, 2026",
    readTime: "9 min read",
    imageCaption: "A political speaker addresses supporters during a public gathering.",
    imageCredit: "Unsplash preview image",
    body: [
      "Brooklyn Rivera, a prominent Indigenous political leader in Nicaragua, has died after spending nearly three years in detention, according to statements from relatives and members of his political movement.",
      "Rivera represented communities on Nicaragua's Caribbean coast and had long advocated for regional autonomy and Indigenous land rights. Authorities detained him after alleging activities that threatened national sovereignty, accusations his supporters rejected.",
      "His relatives said they received limited information about his health and access to legal counsel during his detention. Human-rights organizations repeatedly asked the government to disclose his condition and allow independent visits.",
      "Government representatives said legal procedures were followed but released few details about the circumstances of Rivera's death. Opposition groups called for an independent investigation and the return of his remains to his community.",
      "Rivera's death is expected to intensify international scrutiny of political detentions in Nicaragua and renew debate over the rights of Indigenous communities along the Caribbean coast.",
    ],
    summary: "Indigenous Nicaraguan leader Brooklyn Rivera died after nearly three years in detention, prompting calls for transparency and an independent investigation.",
    summaryPoints: [
      "Rivera was a long-serving advocate for Caribbean-coast autonomy and Indigenous land rights.",
      "He had been detained for nearly three years under national-security allegations disputed by supporters.",
      "Relatives and rights groups said information about his health and legal access was limited.",
      "Opposition and Indigenous organizations are seeking an independent inquiry into his death.",
    ],
    sentimentScore: -0.72,
    sentimentLabel: "negative",
    framingLabel: "left",
    confidence: 0.69,
    framingNotes: "The article foregrounds rights concerns, family testimony, and demands for accountability while including the government's stated legal rationale.",
    loadedTerms: ["political detention", "national sovereignty", "independent investigation"],
    topSources: [
      { name: "Reuters", framing: "center" },
      { name: "Associated Press", framing: "center" },
      { name: "CNN", framing: "left" },
      { name: "BBC", framing: "center" },
      { name: "The Guardian", framing: "left" },
      { name: "Fox News", framing: "right" },
    ],
  },
  "un-emergency-meeting": {
    author: "Leila Haddad",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "9 min read",
    imageCaption: "Damaged buildings stand in an area affected by continuing conflict.",
    imageCredit: "Unsplash preview image",
    body: [
      "The United Nations Security Council is preparing an emergency meeting after Israeli forces moved farther into Lebanon and regional officials warned that the fighting could expand beyond the current front lines.",
      "Lebanese authorities reported new displacement from communities near the fighting and asked international partners to press for an immediate halt. Israel said its operations were aimed at reducing cross-border attacks and protecting northern communities.",
      "Council members are discussing language that would call for civilian protection, humanitarian access, and renewed diplomacy. Diplomats said divisions remain over whether a statement should directly demand a ceasefire or focus on compliance with existing resolutions.",
      "Aid organizations said damaged roads and continuing strikes were making it harder to reach families who had moved to temporary shelters. They called for protected routes for medical teams and relief supplies.",
      "The emergency session is expected to include briefings from U.N. officials and statements from regional representatives. A binding resolution would require agreement among permanent council members, which remained uncertain.",
    ],
    summary: "The Security Council will meet as Israel expands operations in Lebanon, with diplomats divided over ceasefire language and aid groups warning of worsening civilian displacement.",
    summaryPoints: [
      "Israel says the deeper operation is intended to reduce cross-border attacks.",
      "Lebanon has requested international pressure for an immediate halt to the fighting.",
      "Council members are debating civilian-protection, humanitarian-access, and ceasefire language.",
      "Aid organizations report growing displacement and difficulty reaching affected communities.",
    ],
    sentimentScore: -0.66,
    sentimentLabel: "negative",
    framingLabel: "right",
    confidence: 0.67,
    framingNotes: "Security justifications receive substantial space alongside Lebanese civilian-impact reporting and U.N. diplomatic concerns.",
    loadedTerms: ["pushes deeper", "emergency meeting", "regional escalation"],
    topSources: [
      { name: "Reuters", framing: "center" },
      { name: "Associated Press", framing: "center" },
      { name: "BBC", framing: "center" },
      { name: "CNN", framing: "left" },
      { name: "Fox News", framing: "right" },
      { name: "The Jerusalem Post", framing: "right" },
    ],
  },
  "oil-prices": {
    author: "Priya Nair",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "7 min read",
    imageCaption: "Energy infrastructure operates as traders assess global oil supply and demand.",
    imageCredit: "Unsplash preview image",
    body: [
      "Oil prices moved lower as traders weighed the possibility that OPEC+ could approve another production increase while indicators from several large economies pointed to softer fuel demand.",
      "Delegates said the producer group was reviewing whether current market conditions could absorb additional barrels without creating a sustained surplus. No final decision had been announced ahead of the scheduled meeting.",
      "Demand expectations have weakened as manufacturing activity slowed in parts of Asia and Europe. At the same time, seasonal travel and lower inventories in some markets offered support against a sharper price decline.",
      "Analysts said the market remains sensitive to geopolitical disruptions and changes in refinery output. A production increase could pressure prices, but actual exports and compliance with quotas will determine the effect.",
      "Energy companies and consumers are watching the decision for its potential impact on fuel costs and investment. Traders expect volatility to continue until the group publishes its updated supply plan.",
    ],
    summary: "Oil prices slipped as markets considered a possible OPEC+ production increase against signs of weaker demand, though inventories and geopolitical risks limited the decline.",
    summaryPoints: [
      "OPEC+ is considering whether to add more supply at its next meeting.",
      "Manufacturing data has weakened demand expectations in several major economies.",
      "Seasonal travel and lower inventories are providing some support for prices.",
      "Analysts say actual exports and quota compliance will matter more than the headline target alone.",
    ],
    sentimentScore: -0.05,
    sentimentLabel: "neutral",
    framingLabel: "center",
    confidence: 0.75,
    framingNotes: "The coverage treats producer, trader, consumer, and macroeconomic effects proportionally without assigning blame for the price movement.",
    loadedTerms: ["weak demand", "output increase", "price pressure"],
    topSources: [
      { name: "Reuters", framing: "center" },
      { name: "Bloomberg", framing: "center" },
      { name: "Financial Times", framing: "center" },
      { name: "CNBC", framing: "center" },
      { name: "CNN Business", framing: "left" },
      { name: "Fox Business", framing: "right" },
    ],
  },
  "starship-test-flight": {
    author: "Alex Romero",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "8 min read",
    imageCaption: "A heavy-lift rocket rises through exhaust during a launch test.",
    imageCredit: "Unsplash preview image",
    body: [
      "SpaceX launched another Starship test flight, completing several major flight objectives as the company works toward a reusable system designed for missions beyond Earth orbit.",
      "The vehicle cleared the launch site, progressed through stage separation, and transmitted engineering data through most of the planned flight profile. Teams were still reviewing performance from the final descent and recovery sequence.",
      "Company engineers said the test included hardware and software changes based on earlier flights. The program uses rapid test cycles, accepting that some vehicles may be lost while designs are adjusted between launches.",
      "NASA is monitoring development because a version of Starship is planned for future lunar missions. Schedule pressure remains significant, and the system must complete additional demonstrations before it can carry crews.",
      "SpaceX described the flight as an important step toward long-duration missions, while outside experts cautioned that orbital refueling, reliability, and safe recovery still require extensive testing.",
    ],
    summary: "SpaceX's latest Starship flight completed several planned milestones and returned extensive data, while major reliability and refueling demonstrations remain ahead.",
    summaryPoints: [
      "The rocket completed launch and stage-separation objectives during the test profile.",
      "Engineers are reviewing descent and recovery data before setting the next flight plan.",
      "NASA is following progress because Starship is part of future lunar-landing plans.",
      "Orbital refueling, repeated safe recovery, and crew readiness remain unresolved milestones.",
    ],
    sentimentScore: 0.34,
    sentimentLabel: "positive",
    framingLabel: "center",
    confidence: 0.73,
    framingNotes: "The story emphasizes technical progress while giving comparable attention to remaining engineering and schedule risks.",
    loadedTerms: ["milestone", "rapid iteration", "Mars program"],
    topSources: [
      { name: "Reuters", framing: "center" },
      { name: "Associated Press", framing: "center" },
      { name: "Ars Technica", framing: "center" },
      { name: "CNN", framing: "left" },
      { name: "Fox News", framing: "right" },
      { name: "The Wall Street Journal", framing: "right" },
    ],
  },
  "apple-ai-features": {
    author: "Jordan Lee",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "8 min read",
    imageCaption: "An Apple logo appears on the glass facade of a company store.",
    imageCredit: "Unsplash preview image",
    body: [
      "Apple introduced a collection of artificial-intelligence features for the iPhone, iPad, and Mac, placing new writing, image, and personal-assistant tools across its operating systems.",
      "The company said many requests will run directly on users' devices, while more demanding tasks can be sent to specialized cloud servers. Apple presented that design as a way to offer generative features while limiting unnecessary data exposure.",
      "The tools include notification summaries, text rewriting, image creation, and a more context-aware version of Siri. Availability will vary by device, language, and region, and several capabilities will arrive in stages.",
      "Developers and regulators are watching how the system labels generated content, handles copyrighted material, and gives users control over data. Consumer groups said the privacy claims will require independent scrutiny once the features are widely used.",
      "The launch puts Apple more directly into competition with other major AI platforms while relying on its hardware ecosystem as the main point of integration.",
    ],
    summary: "Apple is adding generative writing, image, and assistant features across its devices, emphasizing on-device processing while facing questions about rollout, privacy, and transparency.",
    summaryPoints: [
      "New AI tools will appear across iPhone, iPad, and Mac operating systems.",
      "Apple says many tasks will run on-device, with larger requests handled by protected cloud systems.",
      "The rollout will vary by hardware, region, language, and release stage.",
      "Developers and consumer advocates want independent review of privacy and generated-content safeguards.",
    ],
    sentimentScore: 0.22,
    sentimentLabel: "positive",
    framingLabel: "right",
    confidence: 0.68,
    framingNotes: "The report gives substantial attention to Apple's product and privacy framing while including regulatory and consumer-scrutiny concerns.",
    loadedTerms: ["AI-powered", "privacy-first", "personal intelligence"],
    topSources: [
      { name: "The Wall Street Journal", framing: "right" },
      { name: "Reuters", framing: "center" },
      { name: "Bloomberg", framing: "center" },
      { name: "The Verge", framing: "left" },
      { name: "CNN Business", framing: "left" },
      { name: "Fox Business", framing: "right" },
    ],
  },
  "hottest-years": {
    author: "Sofia Martinez",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "9 min read",
    imageCaption: "A thermometer is silhouetted against intense sunlight during a heat event.",
    imageCredit: "Unsplash preview image",
    body: [
      "Global temperature data indicate that 2025 is likely to rank among the three hottest years recorded, according to an assessment from the European Union's climate monitoring service.",
      "The ranking reflects persistent heat across land and ocean regions, with several months setting or approaching records. Scientists said natural variability influenced individual months but did not explain the long-term warming trend.",
      "Researchers linked the broader rise primarily to greenhouse-gas emissions from fossil fuels and land-use change. Elevated ocean temperatures also contributed to marine heat waves and heavier atmospheric moisture in some regions.",
      "The report noted that a single year's position can change as datasets are finalized. Its authors said the larger finding is the continued concentration of the warmest years in the most recent decade.",
      "Climate agencies urged governments to combine emissions reductions with adaptation measures for heat, wildfire, flooding, and public-health risks that are already affecting communities.",
    ],
    summary: "EU climate monitoring places 2025 among the three warmest years on record, reinforcing a long-term warming trend despite month-to-month natural variability.",
    summaryPoints: [
      "Land and ocean temperatures kept the global annual average near record levels.",
      "Natural variability affected individual months but does not account for the long-term trend.",
      "Scientists identify greenhouse-gas emissions as the main driver of sustained warming.",
      "Climate agencies recommend both emissions cuts and preparation for intensifying impacts.",
    ],
    sentimentScore: -0.58,
    sentimentLabel: "negative",
    framingLabel: "mixed",
    confidence: 0.76,
    framingNotes: "The coverage centers observational climate data while combining urgency about impacts with uncertainty around the final annual ranking.",
    loadedTerms: ["hottest years", "record heat", "climate emergency"],
    topSources: [
      { name: "Reuters", framing: "center" },
      { name: "Associated Press", framing: "center" },
      { name: "BBC", framing: "center" },
      { name: "The Guardian", framing: "left" },
      { name: "CNN", framing: "left" },
      { name: "Fox News", framing: "right" },
    ],
  },
  "fed-rates": {
    author: "Daniel Brooks",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "8 min read",
    imageCaption: "The facade of a central-bank building represents the Federal Reserve's policy role.",
    imageCredit: "Unsplash preview image",
    body: [
      "The Federal Reserve held its benchmark interest rate steady and signaled that officials want more evidence inflation is moving sustainably lower before considering a change in policy.",
      "The decision was widely expected. Policymakers acknowledged that price growth has eased from earlier peaks but remains above the central bank's longer-run goal in several service categories.",
      "Officials also pointed to a labor market that continues to add jobs at a slower pace. They said the current rate level gives the Fed room to respond if inflation reaccelerates or economic activity weakens sharply.",
      "Investors focused on updated projections and the chair's repeated description of future decisions as data-dependent. Markets adjusted expectations for the timing of a possible rate cut but showed limited immediate movement.",
      "Higher borrowing costs continue to affect mortgages, business investment, and consumer credit. The Fed said it is balancing those effects against the risk of easing before inflation is firmly contained.",
    ],
    summary: "The Federal Reserve kept rates unchanged, citing easing but persistent inflation and a cooling labor market while avoiding a firm timetable for future cuts.",
    summaryPoints: [
      "The benchmark rate remains unchanged after the latest policy meeting.",
      "Inflation has moderated but is still above the Fed's longer-run objective in key areas.",
      "Job growth is slowing without showing a broad labor-market collapse.",
      "Officials say incoming inflation and employment data will guide the next move.",
    ],
    sentimentScore: -0.12,
    sentimentLabel: "neutral",
    framingLabel: "center",
    confidence: 0.81,
    framingNotes: "The article emphasizes the Fed's stated tradeoffs and market effects without presenting either tighter or looser policy as the obvious outcome.",
    loadedTerms: ["holds steady", "signals caution", "data-dependent"],
    topSources: [
      { name: "Reuters", framing: "center" },
      { name: "Bloomberg", framing: "center" },
      { name: "The Wall Street Journal", framing: "right" },
      { name: "CNBC", framing: "center" },
      { name: "CNN Business", framing: "left" },
      { name: "Fox Business", framing: "right" },
    ],
  },
  "real-madrid-final": {
    author: "Marco Silva",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "7 min read",
    imageCaption: "A Real Madrid player celebrates in front of supporters after a decisive match.",
    imageCredit: "Unsplash preview image",
    body: [
      "Real Madrid won the Champions League final after recovering from an early deficit and turning the match with a forceful second-half performance.",
      "Their opponents controlled much of the opening period and converted one of several chances before halftime. Madrid stayed within reach through defensive blocks and a series of saves under sustained pressure.",
      "The match changed after the interval as Madrid increased the tempo and created more space through midfield. An equalizer shifted momentum before a late finish completed the comeback.",
      "Coaches on both sides pointed to small tactical decisions and the pressure of the occasion. Madrid's experienced players slowed the match when needed and attacked quickly when possession changed.",
      "The victory adds another European title to the club's record and closes a campaign shaped by narrow knockout wins, squad depth, and decisive late goals.",
    ],
    summary: "Real Madrid overturned a halftime deficit with two second-half goals to win the Champions League final after absorbing sustained early pressure.",
    summaryPoints: [
      "Madrid trailed after their opponents controlled much of the first half.",
      "Defensive stops kept the deficit narrow before the interval.",
      "A faster second-half approach produced an equalizer and a late winning goal.",
      "The result adds another European championship to the club's record.",
    ],
    sentimentScore: 0.66,
    sentimentLabel: "positive",
    framingLabel: "right",
    confidence: 0.52,
    framingNotes: "The political-framing estimate has low confidence because the article is sports coverage; the measured source mix leans right while the text is primarily match analysis.",
    loadedTerms: ["comeback victory", "European giants", "decisive finish"],
    topSources: [
      { name: "Reuters", framing: "center" },
      { name: "Associated Press", framing: "center" },
      { name: "BBC Sport", framing: "center" },
      { name: "ESPN", framing: "center" },
      { name: "Fox Sports", framing: "right" },
      { name: "The Telegraph", framing: "right" },
    ],
  },
  "western-canada-wildfires": {
    author: "Nora Campbell",
    publishedAt: "2026-06-01",
    publishedLabel: "June 1, 2026",
    readTime: "9 min read",
    imageCaption: "A firefighter faces an active wildfire burning through dry forest.",
    imageCredit: "Unsplash preview image",
    body: [
      "Fast-moving wildfires in western Canada forced thousands of residents to leave their communities as dry vegetation, heat, and shifting winds complicated containment efforts.",
      "Provincial authorities issued evacuation orders and alerts across several districts. Emergency crews prioritized moving residents from isolated areas and protecting roads needed for safe travel.",
      "Fire officials said some blazes grew rapidly after wind changes pushed flames across containment lines. Aircraft and ground crews were deployed where smoke and visibility allowed operations to continue.",
      "Temporary reception centers opened in neighboring communities, while health agencies warned about hazardous air quality across a much larger region. Residents were asked to monitor official updates rather than return before orders were lifted.",
      "Forecasters expected difficult conditions to persist until cooler weather or meaningful rainfall arrived. Officials said the scale of damage would not be clear until crews could safely enter affected areas.",
    ],
    summary: "Wildfires driven by heat, dry fuels, and shifting winds prompted large evacuations across western Canada while crews worked to protect communities and critical roads.",
    summaryPoints: [
      "Authorities issued evacuation orders and alerts for multiple western Canadian communities.",
      "Wind shifts caused several fires to expand beyond existing containment lines.",
      "Smoke created hazardous air quality well beyond the immediate fire zones.",
      "Officials expect challenging conditions until temperatures fall or significant rain arrives.",
    ],
    sentimentScore: -0.81,
    sentimentLabel: "negative",
    framingLabel: "right",
    confidence: 0.64,
    framingNotes: "The report emphasizes emergency operations and public-safety instructions while also connecting fire behavior to heat, dryness, and longer-term climate conditions.",
    loadedTerms: ["force thousands", "out of control", "state of emergency"],
    topSources: [
      { name: "CBC News", framing: "center" },
      { name: "Reuters", framing: "center" },
      { name: "Associated Press", framing: "center" },
      { name: "CTV News", framing: "center" },
      { name: "CNN", framing: "left" },
      { name: "Fox News", framing: "right" },
    ],
  },
};

const analysisDisclaimer = "This analysis is generated by AI from the article text and should be treated as an estimate, not an objective determination of political bias.";

function buildSourceBreakdown(article: HomeArticle, topSources: readonly SourceBreakdownItem[]) {
  const leftCount = Math.round(article.sourceCount * article.left / 100);
  const centerCount = Math.round(article.sourceCount * article.center / 100);

  return {
    leftCount,
    centerCount,
    rightCount: article.sourceCount - leftCount - centerCount,
    topSources,
  };
}

function buildRelatedStories(articleId: string): readonly RelatedStory[] {
  return homeArticles
    .filter((article) => article.id !== articleId)
    .slice(0, 6)
    .map((article) => {
      const copy = additionalDetailCopy[article.id];
      const isIranArticle = article.id === iranPeaceProposalDetail.id;

      return {
        id: article.id,
        category: article.category,
        region: article.region,
        title: article.title,
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        publishedAt: isIranArticle ? iranPeaceProposalDetail.publishedAt : copy?.publishedAt ?? "2026-06-01",
        publishedLabel: isIranArticle ? iranPeaceProposalDetail.publishedLabel : copy?.publishedLabel ?? "June 1, 2026",
        readTime: isIranArticle ? iranPeaceProposalDetail.readTime : copy?.readTime ?? "8 min read",
      };
    });
}

function buildPreviewDetail(article: HomeArticle, copy: PreviewDetailCopy): NewsArticleDetail {
  return {
    ...article,
    slug: article.id,
    author: copy.author,
    publishedAt: copy.publishedAt,
    publishedLabel: copy.publishedLabel,
    readTime: copy.readTime,
    imageCaption: copy.imageCaption,
    imageCredit: copy.imageCredit,
    body: copy.body,
    analysis: {
      summary: copy.summary,
      summaryPoints: copy.summaryPoints,
      sentimentScore: copy.sentimentScore,
      sentimentLabel: copy.sentimentLabel,
      framingLabel: copy.framingLabel,
      confidence: copy.confidence,
      framingNotes: copy.framingNotes,
      loadedTerms: copy.loadedTerms,
      disclaimer: analysisDisclaimer,
      model: "Biasly preview analysis",
      generatedAt: copy.publishedAt,
      generatedLabel: copy.publishedLabel,
      readTime: "3 min read",
    },
    sourceBreakdown: buildSourceBreakdown(article, copy.topSources),
    relatedStories: buildRelatedStories(article.id),
  };
}

const additionalDetails = homeArticles
  .filter((article) => article.id !== iranPeaceProposalDetail.id)
  .map((article) => {
    const copy = additionalDetailCopy[article.id];

    if (!copy) {
      throw new Error(`Missing preview detail copy for article ${article.id}.`);
    }

    return buildPreviewDetail(article, copy);
  });

const detailArticles = new Map<string, NewsArticleDetail>([
  [iranPeaceProposalDetail.slug, iranPeaceProposalDetail],
  ...additionalDetails.map((article) => [article.slug, article] as const),
]);

function assertPreviewRegistryIntegrity() {
  const homeArticleIds = new Set(homeArticles.map((article) => article.id));

  for (const article of homeArticles) {
    const detail = detailArticles.get(article.id);

    if (article.href !== `/news/${article.id}`) {
      throw new Error(`Preview article ${article.id} has an invalid news URL.`);
    }

    if (!detail) {
      throw new Error(`Missing preview detail for homepage article ${article.id}.`);
    }

    const sourceTotal = detail.sourceBreakdown.leftCount
      + detail.sourceBreakdown.centerCount
      + detail.sourceBreakdown.rightCount;

    if (sourceTotal !== article.sourceCount) {
      throw new Error(`Source breakdown for article ${article.id} must equal ${article.sourceCount}.`);
    }
  }

  for (const slug of detailArticles.keys()) {
    if (!homeArticleIds.has(slug)) {
      throw new Error(`Preview detail ${slug} does not have a matching homepage article.`);
    }
  }
}

assertPreviewRegistryIntegrity();

export function getPreviewArticle(slug: string) {
  return detailArticles.get(slug);
}

export function getPreviewArticleSlugs() {
  return Array.from(detailArticles.keys());
}
