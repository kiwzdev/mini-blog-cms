"use client";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getBlogById } from "@/api/blog";
import { IBlog } from "@/types/blog";
import Loading from "@/components/Loading";
import { useLoading } from "@/stores/useLoadingStore";
import { BlogContent } from "@/components/blog/BlogContent";

export default function BlogBlogPage() {
  const params = useParams<{ blogId: string }>();
  const blogId = params.blogId;

  const [blog, setBlog] = useState<IBlog | null>(null);
  const { isLoading, setLoading } = useLoading(`blog-blog-${blogId}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null); // clear error ก่อน

      try {
        const response = await getBlogById({blogId});

        if (response.success) {
          setBlog(response.data as IBlog);
        } else if (response.error) {
          throw new Error(response.error.message);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        console.error("Error fetching blog:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, []);

  if (isLoading) return <Loading />;
  if (!blog && !error) return <Loading />;
  if (error === "Blog not found" || !blog) return notFound();
  else return <BlogContent blog={blog} />;
}
