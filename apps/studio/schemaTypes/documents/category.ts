import { TagIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { documentSlugField } from "@/schemaTypes/common";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  description:
    "A category used to organize and filter blog posts by topic.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The name of the category (e.g. Design, Engineering)",
      validation: (Rule) => Rule.required().error("A category title is required"),
    }),
    documentSlugField("category", {}),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 2,
      description: "A short description of what this category covers",
    }),
    defineField({
      name: "color",
      type: "string",
      title: "Color",
      description: "A color identifier for the category badge (e.g. blue, green, purple)",
      options: {
        list: [
          { title: "Blue", value: "blue" },
          { title: "Green", value: "green" },
          { title: "Purple", value: "purple" },
          { title: "Pink", value: "pink" },
          { title: "Orange", value: "orange" },
          { title: "Red", value: "red" },
          { title: "Yellow", value: "yellow" },
          { title: "Teal", value: "teal" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      color: "color",
    },
    prepare: ({ title, slug, color }) => ({
      title: title || "Untitled Category",
      subtitle: `🔗 ${slug ?? "no-slug"} ${color ? `· ${color}` : ""}`,
      media: TagIcon,
    }),
  },
});
