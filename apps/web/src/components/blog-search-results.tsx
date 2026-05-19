"use client";

import { cn } from "@workspace/ui/lib/utils";

import { BlogList } from "@/components/blog-list";
import type { Blog } from "@/types";

type BlogSearchResultsProps = {
  className?: string;
  results: Blog[];
  isSearching: boolean;
  hasQuery: boolean;
  searchQuery: string;
  error?: Error | null;
};

function SearchResultsHeader({
  query,
  count,
}: {
  query: string;
  count: number;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-lg">Search Results for "{query}"</h2>
      <p className="text-muted-foreground text-sm">
        {count === 0
          ? "No articles found"
          : `${count} article${count === 1 ? "" : "s"} found`}
      </p>
    </div>
  );
}

function EmptySearchState({ query }: { query: string }) {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center">
      <div className="mx-auto max-w-lg rounded-3xl border bg-card p-10 shadow-sm transition-all hover:shadow-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="mb-3 font-semibold text-foreground text-xl tracking-tight">
          No matches found
        </h3>
        <p className="mb-6 text-muted-foreground leading-relaxed">
          We couldn't find any articles matching "<span className="font-medium text-foreground">{query}</span>".
        </p>
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <p className="font-medium">Try adjusting your search:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="rounded-full bg-muted px-3 py-1">Check spelling</span>
            <span className="rounded-full bg-muted px-3 py-1">Use broader terms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ query }: { query: string }) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="mb-2 font-medium text-destructive text-lg">
          Search failed
        </h3>
        <p className="mb-4 text-muted-foreground">
          We encountered an error while searching for "{query}". Please try
          again.
        </p>
        <div className="text-muted-foreground text-sm">
          <p>If the problem persists:</p>
          <ul className="mt-2 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Refresh the page</li>
            <li>• Try again in a few moments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const LOADING_SKELETONS = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
  "skeleton-6",
] as const;

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="mb-2 h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {LOADING_SKELETONS.map((id) => (
          <div className="space-y-4" key={id}>
            <div className="aspect-video animate-pulse rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogSearchResults({
  className,
  results,
  isSearching,
  hasQuery,
  searchQuery,
  error,
}: BlogSearchResultsProps) {
  if (!hasQuery) {
    return null;
  }

  if (isSearching) {
    return (
      <section className={cn("mt-8", className)}>
        <LoadingState />
      </section>
    );
  }

  return (
    <section className={cn("mt-8", className)}>
      <SearchResultsHeader count={results.length} query={searchQuery} />

      {error ? (
        <ErrorState query={searchQuery} />
      ) : results.length === 0 ? (
        <EmptySearchState query={searchQuery} />
      ) : (
        <BlogList blogs={results} />
      )}
    </section>
  );
}
