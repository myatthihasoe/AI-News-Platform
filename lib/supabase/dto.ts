export type FramingLabel = "left" | "center" | "right" | "mixed" | "unclear";
export type SentimentLabel = "positive" | "neutral" | "negative";

export type ArticleAnalysisDto = {
  summary: string;
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  biasScore: number;
  biasLabel: FramingLabel;
  confidence: number;
  framingNotes: string;
  loadedTerms: readonly string[];
  disclaimer: string;
  model: string;
  generatedAt: string;
};

export type ArticleSourceDto = {
  id: number;
  name: string;
  listingUrl: string;
  logoUrl: string | null;
};

export type ArticleFeedItem = {
  id: number;
  slug: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  category: string | null;
  region: string | null;
  publishedAt: string;
  readTimeMinutes: number | null;
  source: ArticleSourceDto;
  analysis: ArticleAnalysisDto;
};

export type RelatedArticleDto = Omit<ArticleFeedItem, "analysis" | "source"> & {
  source: Pick<ArticleSourceDto, "id" | "name" | "logoUrl">;
  similarity: number;
};

export type ArticleDetail = ArticleFeedItem & {
  author: string | null;
  originalUrl: string;
  canonicalUrl: string;
  body: readonly string[];
};
