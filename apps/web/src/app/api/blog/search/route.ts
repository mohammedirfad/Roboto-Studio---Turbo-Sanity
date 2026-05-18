import { sanityFetch } from "@workspace/sanity/live";
import { queryAllBlogDataForSearch } from "@workspace/sanity/query";
import { algoliasearch } from "algoliasearch";
import Fuse from "fuse.js";
import { NextResponse } from "next/server";

export const revalidate = 300; // every 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  // Use Algolia if configured
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || process.env.ALGOLIA_ADMIN_KEY;

  if (appId && searchKey) {
    try {
      const client = algoliasearch(appId, searchKey);
      const results = await client.searchSingleIndex({
        indexName: "blog_posts",
        searchParams: { 
          query: query,
          hitsPerPage: 10 
        },
      });
      
      // Map objectID to _id so the frontend components (like BlogList) don't throw key errors
      const mappedHits = results.hits.map((hit: any) => ({
        ...hit,
        _id: hit.objectID
      }));
      
      return NextResponse.json(mappedHits);
    } catch (error) {
      console.error("Algolia search error:", error);
      // Fallback to local search on error
    }
  }

  // Fallback to local Fuse.js search
  const { data } = await sanityFetch({
    query: queryAllBlogDataForSearch,
    stega: false,
  });

  if (!data) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  const fuse = new Fuse(data, {
    keys: ["title", "description", "slug", "authors.name"],
    threshold: 0.3,
  });

  const fuseResults = fuse.search(query, {
    limit: 10,
  });
  return NextResponse.json(fuseResults.map((result) => result.item));
}
