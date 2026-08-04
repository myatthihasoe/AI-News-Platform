import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { NewsDetails } from "@/components/news/news-details";
import { getAnalyzedArticleBySlug } from "@/lib/supabase/queries/articles";

type NewsPageProps = {
  params: Promise<{ slug: string }>;
};

const getArticle = cache((slug: string) => getAnalyzedArticleBySlug(slug));

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Article not found" };
  }

  return {
    title: article.title,
    description: article.analysis.summary,
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return <NewsDetails article={article} />;
}
