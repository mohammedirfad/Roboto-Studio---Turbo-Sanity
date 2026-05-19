import { Badge } from "@workspace/ui/components/badge";

import type { PagebuilderType } from "@/types";
import { RichText } from "../elements/rich-text";
import { SanityButtons } from "../elements/sanity-buttons";
import { SanityImage } from "../elements/sanity-image";

type HeroBlockProps = PagebuilderType<"hero">;

export function HeroBlock({
  title,
  buttons,
  badge,
  image,
  richText,
}: HeroBlockProps) {
  return (
    <section className="mt-4 md:my-16" id="hero">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="grid h-full grid-rows-[auto_1fr_auto] items-center justify-items-center gap-6 text-center lg:items-start lg:justify-items-start lg:text-left">
            {badge && (
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium animate-pulse bg-primary/10 text-primary border-primary/20">
                {badge}
              </Badge>
            )}
            <div className="grid gap-6">
              <h1 className="text-balance font-extrabold text-5xl lg:text-7xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/50 leading-tight">
                {title}
              </h1>
              <RichText
                className="font-medium text-muted-foreground text-lg md:text-xl max-w-[600px] leading-relaxed"
                richText={richText}
              />
            </div>
            <SanityButtons
              buttonClassName="w-full sm:w-auto transition-transform hover:scale-105 shadow-md hover:shadow-lg"
              buttons={buttons}
              className="mb-8 mt-4 grid w-full gap-4 sm:w-fit sm:grid-flow-col lg:justify-start"
            />
          </div>

          {image && (
            <div className="h-96 w-full relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-2xl transform group-hover:scale-110 transition-transform duration-700"></div>
              <SanityImage
                className="max-h-96 w-full rounded-3xl object-cover border border-white/10 shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2 relative z-10"
                fetchPriority="high"
                height={800}
                image={image}
                loading="eager"
                width={800}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
