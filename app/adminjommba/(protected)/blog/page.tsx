// app/adminjommba/(protected)/blog/page.tsx
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/admin/queries";
import { BlogClient } from "./blog-client";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogClient posts={posts} />;
}
