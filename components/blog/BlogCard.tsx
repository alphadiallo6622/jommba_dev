import Link from "next/link";
import { BookOpen, Calendar, Clock, ArrowUpRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const isFeatured = featured && post.featured;

  if (isFeatured) {
    return (
      <Card
        hover
        padding="none"
        className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden items-stretch"
      >
        {/* Cover Banner */}
        <div className="lg:col-span-6 relative bg-gradient-to-br from-primary-dark via-primary to-emerald-700 flex flex-col justify-center items-center p-12 text-white overflow-hidden aspect-video lg:aspect-auto">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 blur-md" />
          
          <BookOpen className="w-16 h-16 opacity-20 stroke-[1.5] mb-4" />
          <div className="text-center text-xs font-bold tracking-widest uppercase opacity-75">
            Article à la Une
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Badge variant="primary">{post.category}</Badge>
            
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary hover:text-primary transition-colors duration-200 leading-snug">
              <Link href={`/blog/${post.slug}`} className="flex items-start gap-1 group">
                <span>{post.title}</span>
                <ArrowUpRight className="w-5 h-5 shrink-0 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
              </Link>
            </h2>

            <p className="text-sm text-text-muted leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <div className="border-t border-primary-light/35 pt-4 flex items-center justify-between gap-4">
            {/* Author */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary font-bold text-xs flex items-center justify-center shadow-sm">
                {post.author.avatar}
              </div>
              <div className="text-xs font-bold text-text-primary">
                {post.author.name}
              </div>
            </div>

            {/* Read Time & Date */}
            <div className="flex items-center gap-3 text-[11px] text-text-subtle font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span className="w-1 h-1 rounded-full bg-text-subtle/30" />
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card hover padding="none" className="flex flex-col h-full overflow-hidden">
      {/* Cover Banner */}
      <div className={`relative bg-gradient-to-br ${post.coverGradient} flex flex-col justify-center items-center p-8 text-white aspect-video overflow-hidden shrink-0`}>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 blur-xl" />
        <BookOpen className="w-12 h-12 opacity-25 stroke-[1.5]" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col justify-between flex-1 space-y-6">
        <div className="space-y-3">
          <Badge variant="primary" className="w-fit">{post.category}</Badge>
          
          <h3 className="text-lg font-bold font-serif text-text-primary hover:text-primary transition-colors duration-200 leading-snug">
            <Link href={`/blog/${post.slug}`} className="flex items-start gap-0.5 group">
              <span>{post.title}</span>
              <ArrowUpRight className="w-4 h-4 shrink-0 text-text-subtle group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
            </Link>
          </h3>

          <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        <div className="border-t border-primary-light/35 pt-4 flex items-center justify-between gap-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-[10px] flex items-center justify-center shadow-sm">
              {post.author.avatar}
            </div>
            <div className="text-[11px] font-bold text-text-primary">
              {post.author.name}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2.5 text-[10px] text-text-subtle font-medium">
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-text-subtle/30" />
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
