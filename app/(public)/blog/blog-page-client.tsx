"use client";

import { useState } from "react";
import BlogHero from "@/components/blog/BlogHero";
import BlogGrid from "@/components/blog/BlogGrid";
import type { BlogPost } from "@/data/blogPosts";

export function BlogPageClient({ posts }: { posts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <BlogHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <BlogGrid searchQuery={searchQuery} posts={posts} />
    </>
  );
}
