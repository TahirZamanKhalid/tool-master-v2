import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  description: string;
  url?: string;
}

export const ShareButtons = ({ title, description, url }: ShareButtonsProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Use current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (platform?: string) => {
    // Native share API for mobile
    if (!platform && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    }

    // Desktop fallback - open share links
    if (platform) {
      window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-2">Share:</span>

      {/* Mobile Native Share */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare()}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}

      {/* Desktop Share Buttons */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="gap-2"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="gap-2"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="gap-2"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="gap-2"
        title="Copy link"
      >
        <LinkIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Copy Link</span>
      </Button>
    </div>
  );
};
