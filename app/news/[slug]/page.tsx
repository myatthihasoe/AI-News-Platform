import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsDetails } from "@/components/news/news-details";
import { getPreviewArticle, getPreviewArticleSlugs } from "@/lib/news/preview-articles";

type NewsPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPreviewArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getPreviewArticle(slug);

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
  const article = getPreviewArticle(slug);

  if (!article) {
    notFound();
  }

  return <NewsDetails article={article} />;
}
