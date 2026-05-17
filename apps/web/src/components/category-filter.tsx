"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@workspace/ui/lib/utils";

type Category = {
  _id: string;
  title: string | null;
  slug: string | null;
  color: string | null;
};

type CategoryFilterProps = {
  categories: Category[];
  currentCategorySlug?: string;
};

export function CategoryFilter({ categories, currentCategorySlug }: CategoryFilterProps) {
  const pathname = usePathname();

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="my-8 flex flex-wrap gap-3">
      <Link
        href="/blog"
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90 hover:text-primary-foreground",
          pathname === "/blog"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        All
      </Link>
      {categories.map((category) => {
        const cleanSlug = category.slug?.startsWith("/") ? category.slug.slice(1) : category.slug;
        const isActive = currentCategorySlug === cleanSlug;
        
        // Define explicit Tailwind classes so the JIT compiler doesn't strip them
        const colorStyles: Record<string, string> = {
          blue: "ring-2 ring-blue-500",
          indigo: "ring-2 ring-indigo-500",
          rose: "ring-2 ring-rose-500",
          pink: "ring-2 ring-pink-500",
          emerald: "ring-2 ring-emerald-500",
          green: "ring-2 ring-green-500",
          red: "ring-2 ring-red-500",
          orange: "ring-2 ring-orange-500",
          yellow: "ring-2 ring-yellow-500",
          purple: "ring-2 ring-purple-500",
          cyan: "ring-2 ring-cyan-500",
        };
        
        const colorClass = category.color ? colorStyles[category.color] : "";

        return (
          <Link
            key={category._id}
            href={`/blog/category/${cleanSlug}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90 hover:text-primary-foreground",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
              isActive && colorClass
            )}
          >
            {category.title}
          </Link>
        );
      })}
    </div>
  );
}
