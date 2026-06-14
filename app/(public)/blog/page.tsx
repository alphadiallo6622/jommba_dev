"use client";

import { useState } from "react";
import BlogHero from "@/components/blog/BlogHero";
import BlogGrid from "@/components/blog/BlogGrid";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <BlogHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <BlogGrid searchQuery={searchQuery} />
    </>
  );
}
