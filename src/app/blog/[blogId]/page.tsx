"use client";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getPostById } from "@/api/post";
import { IBlog } from "@/types/blog";
import Loading from "@/components/layout/Loading";
import { useLoading } from "@/stores/useLoadingStore";
import { BlogContent } from "@/components/blog/BlogContent";

export default function BlogPostPage() {
  const params = useParams<{ blogId: string }>();
  const blogId = params.blogId;

  const [post, setPost] = useState<IBlog | null>(null);
  const { isLoading, setLoading } = useLoading(`blog-post-${blogId}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null); // clear error ก่อน

      try {
        const response = await getPostById(blogId);

        if (response.success) {
          setPost(response.data as IBlog);
        } else if (response.error) {
          throw new Error(response.error.message);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        console.error("Error fetching post:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  if (isLoading) return <Loading />;
  if (!post && !error) return <Loading />;
  if (error === "Post not found" || !post) return notFound();
  else return <BlogContent post={post} />;
}
