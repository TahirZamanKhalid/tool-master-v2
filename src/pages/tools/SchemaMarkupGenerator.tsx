import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Code, Copy, Download } from "lucide-react";
import { normalizeAbsoluteUrl } from "@/utils/seoTools";

const SchemaMarkupGenerator = () => {
  const [schemaType, setSchemaType] = useState("article");
  const [generatedSchema, setGeneratedSchema] = useState("");

  // Article schema fields
  const [articleTitle, setArticleTitle] = useState("");
  const [articleDescription, setArticleDescription] = useState("");
  const [articleAuthor, setArticleAuthor] = useState("");
  const [articleDate, setArticleDate] = useState("");
  const [articleImage, setArticleImage] = useState("");

  // Organization schema fields
  const [orgName, setOrgName] = useState("");
  const [orgUrl, setOrgUrl] = useState("");
  const [orgLogo, setOrgLogo] = useState("");
  const [orgDescription, setOrgDescription] = useState("");

  // Product schema fields
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCurrency, setProductCurrency] = useState("USD");

  // FAQ schema fields
  const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([
    { question: "", answer: "" }
  ]);

  const generateSchema = () => {
    let schema: any = {
      "@context": "https://schema.org"
    };

    switch (schemaType) {
      case "article":
        if (!articleTitle || !articleAuthor) {
          toast.error("Please fill in required fields (title and author)");
          return;
        }
        schema["@type"] = "Article";
        schema.headline = articleTitle;
        schema.description = articleDescription;
        schema.author = {
          "@type": "Person",
          name: articleAuthor
        };
        if (articleDate) schema.datePublished = articleDate;
        if (articleImage) {
          const imageUrl = normalizeAbsoluteUrl(articleImage);
          if (!imageUrl) {
            toast.error("Please enter a valid article image URL");
            return;
          }
          schema.image = imageUrl;
        }
        break;

      case "organization":
        if (!orgName || !orgUrl) {
          toast.error("Please fill in required fields (name and URL)");
          return;
        }
        schema["@type"] = "Organization";
        schema.name = orgName;
        const normalizedOrgUrl = normalizeAbsoluteUrl(orgUrl);
        if (!normalizedOrgUrl) {
          toast.error("Please enter a valid organization URL");
          return;
        }
        schema.url = normalizedOrgUrl;
        if (orgLogo) {
          const logoUrl = normalizeAbsoluteUrl(orgLogo);
          if (!logoUrl) {
            toast.error("Please enter a valid logo URL");
            return;
          }
          schema.logo = logoUrl;
        }
        if (orgDescription) schema.description = orgDescription;
        break;

      case "product":
        if (!productName || !productPrice) {
          toast.error("Please fill in required fields (name and price)");
          return;
        }
        schema["@type"] = "Product";
        schema.name = productName;
        schema.description = productDescription;
        if (productImage) {
          const imageUrl = normalizeAbsoluteUrl(productImage);
          if (!imageUrl) {
            toast.error("Please enter a valid product image URL");
            return;
          }
          schema.image = imageUrl;
        }
        if (!Number.isFinite(Number(productPrice)) || Number(productPrice) <= 0) {
          toast.error("Please enter a valid product price");
          return;
        }
        schema.offers = {
          "@type": "Offer",
          price: productPrice,
          priceCurrency: productCurrency
        };
        break;

      case "faq":
        const validFaqs = faqItems.filter(f => f.question.trim() && f.answer.trim());
        if (validFaqs.length === 0) {
          toast.error("Please add at least one FAQ with question and answer");
          return;
        }
        schema["@type"] = "FAQPage";
        schema.mainEntity = validFaqs.map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }));
        break;
    }

    const formatted = JSON.stringify(schema, null, 2);
    setGeneratedSchema(formatted);
    toast.success("Schema markup generated!");
  };

  const copySchema = () => {
    const scriptTag = `<script type="application/ld+json">\n${generatedSchema}\n</script>`;
    navigator.clipboard.writeText(scriptTag);
    toast.success("Schema copied with script tags!");
  };

  const downloadSchema = () => {
    const scriptTag = `<script type="application/ld+json">\n${generatedSchema}\n</script>`;
    const blob = new Blob([scriptTag], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema-${schemaType}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Schema downloaded!");
  };

  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: "", answer: "" }]);
  };

  const updateFaqItem = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqItems];
    updated[index][field] = value;
    setFaqItems(updated);
  };

  const removeFaqItem = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  };

  return (
    <ToolLayout
      title="Schema Markup Generator"
      description="Generate JSON-LD structured data for better SEO and rich snippets in search results. Free schema.org markup generator."
      category="SEO & Marketing"
      instructions={[
        "Select the type of schema markup you need",
        "Fill in the required fields for your schema type",
        "Click generate to create JSON-LD code",
        "Copy the generated code with script tags",
        "Add the code to your HTML <head> section"
      ]}
      relatedTools={[
        { name: "Meta Tag Generator", path: "/tools/meta-tag-generator" },
        { name: "Open Graph Generator", path: "/tools/open-graph-generator" },
        { name: "Robots.txt Generator", path: "/tools/robots-txt-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label>Schema Type</Label>
              <Select value={schemaType} onValueChange={setSchemaType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="faq">FAQ Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {schemaType === "article" && (
              <>
                <div>
                  <Label htmlFor="article-title">Article Title *</Label>
                  <Input
                    id="article-title"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="Your article headline"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="article-description">Description</Label>
                  <Textarea
                    id="article-description"
                    value={articleDescription}
                    onChange={(e) => setArticleDescription(e.target.value)}
                    placeholder="Brief description of the article"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="article-author">Author Name *</Label>
                  <Input
                    id="article-author"
                    value={articleAuthor}
                    onChange={(e) => setArticleAuthor(e.target.value)}
                    placeholder="John Doe"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="article-date">Published Date</Label>
                  <Input
                    id="article-date"
                    type="date"
                    value={articleDate}
                    onChange={(e) => setArticleDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="article-image">Image URL</Label>
                  <Input
                    id="article-image"
                    value={articleImage}
                    onChange={(e) => setArticleImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
                </div>
              </>
            )}

            {schemaType === "organization" && (
              <>
                <div>
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Your Company Name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="org-url">Website URL *</Label>
                  <Input
                    id="org-url"
                    value={orgUrl}
                    onChange={(e) => setOrgUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="org-logo">Logo URL</Label>
                  <Input
                    id="org-logo"
                    value={orgLogo}
                    onChange={(e) => setOrgLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="org-description">Description</Label>
                  <Textarea
                    id="org-description"
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    placeholder="Brief description of your organization"
                    className="mt-2"
                  />
                </div>
              </>
            )}

            {schemaType === "product" && (
              <>
                <div>
                  <Label htmlFor="product-name">Product Name *</Label>
                  <Input
                    id="product-name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Product Name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Product description"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="product-image">Image URL</Label>
                  <Input
                    id="product-image"
                    value={productImage}
                    onChange={(e) => setProductImage(e.target.value)}
                    placeholder="https://example.com/product.jpg"
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product-price">Price *</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="99.99"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-currency">Currency</Label>
                    <Input
                      id="product-currency"
                      value={productCurrency}
                      onChange={(e) => setProductCurrency(e.target.value)}
                      placeholder="USD"
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}

            {schemaType === "faq" && (
              <div className="space-y-4">
                <Label>FAQ Items</Label>
                {faqItems.map((item, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">FAQ #{index + 1}</span>
                      {faqItems.length > 1 && (
                        <Button
                          onClick={() => removeFaqItem(index)}
                          size="sm"
                          variant="ghost"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <Input
                      value={item.question}
                      onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                      placeholder="Question"
                    />
                    <Textarea
                      value={item.answer}
                      onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                      placeholder="Answer"
                    />
                  </div>
                ))}
                <Button onClick={addFaqItem} variant="outline" className="w-full">
                  Add FAQ Item
                </Button>
              </div>
            )}

            <Button onClick={generateSchema} className="w-full" size="lg">
              <Code className="h-4 w-4 mr-2" />
              Generate Schema Markup
            </Button>
          </CardContent>
        </Card>

        {generatedSchema && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Generated Schema Markup</h3>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copySchema} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadSchema} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                <code>{`<script type="application/ld+json">\n${generatedSchema}\n</script>`}</code>
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Schema Markup Benefits</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Rich snippets:</strong> Enhanced search results with ratings, images, prices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Better CTR:</strong> Stand out in search results with additional information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Voice search:</strong> Help voice assistants understand your content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Knowledge panels:</strong> Increase chances of appearing in knowledge graphs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">-</span>
                <span><strong>Validation:</strong> Test with Google Rich Results Test tool</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default SchemaMarkupGenerator;
