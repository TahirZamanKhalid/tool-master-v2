import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BlogPostingSchema } from "@/components/SEOSchema";
import { blogPosts } from "@/data/blogPosts";
import { allTools } from "@/data/allTools";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const BlogPostDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Post not found</h1>
                <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
            </div>
        );
    }

    // Find related tools based on category or tags
    const relatedTools = allTools
        .filter(tool =>
            tool.category.toLowerCase().includes(post.category.toLowerCase()) ||
            post.tags.some(tag => tool.title.toLowerCase().includes(tag.toLowerCase()))
        )
        .slice(0, 4);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEOHead
                title={post.title}
                description={post.excerpt}
                keywords={[...post.tags, "tutorial", "guide", "how to", "free online tools", "ToolMaster Pro"].join(", ")}
                canonical={`https://toolmaster.cloud/blog/${post.slug}`}
                type="article"
                author={post.author}
                publishedTime={post.date}
                modifiedTime={post.date}
                articleTags={post.tags}
                breadcrumbs={[
                  { name: "Home", url: "https://toolmaster.cloud/" },
                  { name: "Blog", url: "https://toolmaster.cloud/blog" },
                  { name: post.title, url: `https://toolmaster.cloud/blog/${post.slug}` },
                ]}
                jsonLd={{
                  "@context": "https://schema.org",
                  "@type": "Article",
                  "@id": `https://toolmaster.cloud/blog/${post.slug}`,
                  headline: post.title,
                  description: post.excerpt,
                  image: `https://toolmaster.cloud${post.image}`,
                  datePublished: post.date,
                  dateModified: post.date,
                  author: {
                    "@type": "Person",
                    name: post.author,
                  },
                  publisher: { "@id": "https://toolmaster.cloud/#organization" },
                  isPartOf: { "@id": "https://toolmaster.cloud/blog" },
                  mainEntityOfPage: `https://toolmaster.cloud/blog/${post.slug}`,
                  keywords: post.tags.join(", "),
                  articleSection: post.category,
                  inLanguage: "en-US",
                  wordCount: post.readTime ? parseInt(post.readTime) * 200 : undefined,
                }}
            />

            <Header />

            <main className="flex-1 py-12 px-4">
                <div className="container max-w-4xl mx-auto">
                    <Button variant="ghost" onClick={() => navigate("/blog")} className="mb-8">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Articles
                    </Button>

                    <article className="prose prose-slate dark:prose-invert max-w-none">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-[400px] object-cover rounded-2xl mb-8 shadow-xl"
                        />

                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 not-prose">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(post.date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{post.readTime}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleShare} className="ml-auto">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap gap-2 mb-12 not-prose">
                            {post.tags.map(tag => (
                                <Badge key={tag} variant="secondary">#{tag}</Badge>
                            ))}
                        </div>

                        <div
                            className="mt-8 text-lg leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/^# .*\n/, '') }}
                        />
                    </article>

                    <hr className="my-16 border-border" />

                    {/* Call to Action: Related Tools */}
                    <section className="bg-muted/30 rounded-2xl p-8 border border-border/50 shadow-sm transition-all hover:shadow-md">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="bg-primary/10 p-2 rounded-lg text-primary text-xl">🛠️</span>
                            Try the Best Free Tools
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {relatedTools.map((tool, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => navigate(tool.path)}
                                    className="bg-card p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-all flex items-center gap-4 group"
                                >
                                    <div className="bg-primary/5 p-3 rounded-lg group-hover:bg-primary/10 transition-colors">
                                        <tool.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{tool.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{tool.description}</p>
                                    </div>
                                </div>
                            ))}
                            <div
                                onClick={() => navigate("/")}
                                className="sm:col-span-2 bg-primary text-primary-foreground p-4 rounded-xl hover:bg-primary/90 cursor-pointer transition-all text-center font-bold"
                            >
                                Explore All 100+ Free Tools Now!
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPostDetail;
