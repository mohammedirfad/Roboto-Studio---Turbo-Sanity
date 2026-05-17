import { sanityFetch } from "@workspace/sanity/live";
import {
  queryBlogCategoryPageBlogs,
  queryBlogCategoryPageBlogsCount,
  queryCategoryData,
  queryCategories,
  queryCategoryPaths,
} from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { BlogHeader } from "@/components/blog-card";
import { BlogPageContent } from "@/components/blog-page-content";
import { getSEOMetadata } from "@/lib/seo";
import {
  calculatePaginationMetadata,
  getBlogPaginationStartEnd,
  handleErrors,
} from "@/utils";
import { client } from "@workspace/sanity/client";
import { Logger } from "@workspace/logger";

const logger = new Logger("BlogCategorySlug");

async function fetchCategoryData(categorySlug: string) {
  const sanitySlug = categorySlug.startsWith("/") ? categorySlug : `/${categorySlug}`;
  logger.info(`Fetching category data for slug: ${sanitySlug}`);
  const res = await sanityFetch({
    query: queryCategoryData,
    params: { categorySlug: sanitySlug },
  });
  logger.info(`Result for slug ${sanitySlug}:`, res.data);
  return res.data;
}

async function fetchBlogCategoryPageBlogs(categorySlug: string, start: number, end: number) {
  const sanitySlug = categorySlug.startsWith("/") ? categorySlug : `/${categorySlug}`;
  const res = await sanityFetch({
    query: queryBlogCategoryPageBlogs,
    params: { categorySlug: sanitySlug, start, end },
  });
  return res.data;
}

async function fetchBlogCategoryPageBlogsCount(categorySlug: string) {
  const sanitySlug = categorySlug.startsWith("/") ? categorySlug : `/${categorySlug}`;
  const res = await sanityFetch({
    query: queryBlogCategoryPageBlogsCount,
    params: { categorySlug: sanitySlug },
  });
  return res.data;
}

async function fetchCategories() {
  const res = await sanityFetch({
    query: queryCategories,
  });
  return res.data;
}

async function fetchCategoryPaths() {
  try {
    const slugs = await client.fetch(queryCategoryPaths);

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return [];
    }

    const paths: { slug: string }[] = [];
    for (const slug of slugs) {
      if (!slug) continue;
      const cleanSlug = slug.startsWith("/") ? slug.slice(1) : slug;
      paths.push({ slug: cleanSlug });
    }
    return paths;
  } catch (error) {
    logger.error("Error fetching category paths", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sanitySlug = slug.startsWith("/") ? slug : `/${slug}`;
  const { data: result } = await sanityFetch({
    query: queryCategoryData,
    params: { categorySlug: sanitySlug },
  });
  
  return getSEOMetadata({
    title: result?.title ? `${result.title} Blog Posts` : "Category",
    description: result?.description ?? `Browse our latest blog posts in the ${result?.title} category.`,
    slug: `/blog/category/${slug}`,
    contentId: result?._id,
    contentType: "category",
  });
}

export async function generateStaticParams() {
  const paths = await fetchCategoryPaths();
  return paths;
}

export const dynamicParams = true;

type BlogCategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function BlogCategoryPage({ params, searchParams }: BlogCategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = page ? Number(page) : 1;

  // Fetch page data and total count in parallel
  const [[categoryData, errCategoryData], [totalCount, errTotalCount], [categories, errCategories]] =
    await Promise.all([
      handleErrors(fetchCategoryData(slug)),
      handleErrors(fetchBlogCategoryPageBlogsCount(slug)),
      handleErrors(fetchCategories()),
    ]);

  if (errCategoryData || !categoryData) {
    logger.error("Category not found or error fetching data", { slug, errCategoryData, categoryData });
    notFound();
  }

  // Use the Category data to create pseudo indexPageData for BlogPageContent
  // since BlogPageContent expects indexPageData structure
  const indexPageData: any = {
    _id: categoryData._id,
    _type: "category",
    title: `${categoryData.title} Posts`,
    description: categoryData.description || `Browse posts in the ${categoryData.title} category.`,
    displayFeaturedBlogs: false, // Don't show featured on category pages
    featuredBlogsCount: 0,
    pageBuilder: [],
  };

  if (errTotalCount || totalCount === null || totalCount === undefined) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <BlogHeader
          description={indexPageData.description}
          title={indexPageData.title}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Unable to load blog posts at the moment.
          </p>
        </div>
      </main>
    );
  }

  const paginationMetadata = calculatePaginationMetadata(
    totalCount,
    currentPage
  );

  const { start, end } = getBlogPaginationStartEnd(currentPage);

  const [blogs, errBlogs] = await handleErrors(
    fetchBlogCategoryPageBlogs(slug, start, end)
  );

  if (errBlogs || !blogs || blogs.length === 0) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <BlogHeader
          description={indexPageData.description}
          title={indexPageData.title}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No blog posts available in this category.
          </p>
        </div>
        <BlogPageContent
          blogs={[]}
          indexPageData={indexPageData}
          paginationMetadata={paginationMetadata}
          categories={categories ?? undefined}
          currentCategorySlug={slug}
        />
      </main>
    );
  }

  return (
    <BlogPageContent
      blogs={blogs}
      indexPageData={indexPageData}
      paginationMetadata={paginationMetadata}
      categories={categories ?? undefined}
      currentCategorySlug={slug}
    />
  );
}
