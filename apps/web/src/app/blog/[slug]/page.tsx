import { Logger } from "@workspace/logger";
import { client } from "@workspace/sanity/client";
import { sanityFetch } from "@workspace/sanity/live";
import { queryBlogPaths, queryBlogSlugPageData } from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { RichText } from "@/components/elements/rich-text";
import { SanityImage } from "@/components/elements/sanity-image";
import { TableOfContent } from "@/components/elements/table-of-content";
import { ArticleJsonLd } from "@/components/json-ld";
import { getSEOMetadata } from "@/lib/seo";

const logger = new Logger("BlogSlug");

async function fetchBlogSlugPageData(slug: string) {
  return await sanityFetch({
    query: queryBlogSlugPageData,
    params: { slug },
  });
}

async function fetchBlogPaths() {
  try {
    const slugs = await client.fetch(queryBlogPaths);

    // If no slugs found, return empty array to prevent build errors
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return [];
    }

    const paths: { slug: string }[] = [];
    for (const slug of slugs) {
      if (!slug) {
        continue;
      }
      const [, , path] = slug.split("/");
      if (path) {
        paths.push({ slug: path });
      }
    }
    return paths;
  } catch (error) {
    logger.error("Error fetching blog paths", error);
    // Return empty array to allow build to continue
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const slugString = `/blog/${slug}`;
  const { data } = await fetchBlogSlugPageData(slugString);
  return getSEOMetadata({
    title: data?.title ?? data?.seoTitle,
    description: data?.description ?? data?.seoDescription,
    slug: slugString,
    contentId: data?._id,
    contentType: data?._type,
    pageType: "article",
  });
}

export async function generateStaticParams() {
  const paths = await fetchBlogPaths();
  return paths;
}

// Allow dynamic params for paths not generated at build time
export const dynamicParams = true;

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const slugString = `/blog/${slug}`;
  const { data } = await fetchBlogSlugPageData(slugString);
  if (!data) {
    return notFound();
  }
  const { title, description, image, richText, pokemon } = data ?? {};

  return (
    <div className="container mx-auto my-16 px-4 md:px-6">
      <ArticleJsonLd article={data} />
      
      <header className="mb-14 text-center max-w-4xl mx-auto flex flex-col items-center">
        {pokemon?.spriteUrl && (
          <div className="mb-8 inline-flex flex-col items-center gap-3">
            <div className="relative group flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-800/50 shadow-lg transition-transform duration-300 hover:scale-110">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img 
                src={pokemon.spriteUrl} 
                alt={pokemon.name || "Pokemon mascot"} 
                className="relative z-10 h-24 w-24 object-contain drop-shadow-xl" 
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase text-indigo-500 dark:text-indigo-400">
              {pokemon.name}
            </span>
          </div>
        )}
        <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-balance">
          {title}
        </h1>
        <p className="mt-6 text-xl text-muted-foreground leading-relaxed text-balance">
          {description}
        </p>
      </header>

      {image && (
        <div className="mb-16 w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-xl ring-1 ring-gray-900/5">
          <SanityImage
            alt={title}
            className="h-auto w-full object-cover aspect-video md:aspect-[21/9]"
            height={900}
            image={image}
            loading="eager"
            width={1600}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px] max-w-6xl mx-auto">
        <main className="prose prose-lg dark:prose-invert max-w-none [&>p]:mb-8 [&>p]:leading-loose">
          <RichText richText={richText} />
        </main>

        <div className="hidden lg:block">
          <div className="sticky top-8 rounded-lg">
            <TableOfContent richText={richText ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
