import { algoliasearch } from "algoliasearch";
import { NextResponse } from "next/server";

import { client } from "@workspace/sanity/client";

// Ensure this route is not statically generated
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;

    if (!appId || !adminKey) {
      return NextResponse.json(
        { error: "Algolia credentials not configured in environment" },
        { status: 500 }
      );
    }

    const algoliaClient = algoliasearch(appId, adminKey);

    // Fetch all blog posts from Sanity
    const blogs = await client.fetch(`
      *[_type == "blog" && defined(slug.current)] {
        _id,
        title,
        "slug": slug.current,
        description,
        "categories": categories[]->title,
        publishedAt
      }
    `);

    // Transform to Algolia records
    const records = blogs.map((blog: any) => ({
      objectID: blog._id,
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      categories: blog.categories || [],
      publishedAt: blog.publishedAt,
    }));

    // Save records to Algolia
    await algoliaClient.saveObjects({ indexName: "blog_posts", objects: records });

    return NextResponse.json({
      success: true,
      message: `Successfully indexed ${records.length} blog posts to Algolia`,
    });
  } catch (error: any) {
    console.error("Algolia sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync to Algolia", details: error.message },
      { status: 500 }
    );
  }
}
