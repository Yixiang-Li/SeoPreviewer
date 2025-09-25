import SocialPreview from '../SocialPreview';

export default function SocialPreviewExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SocialPreview
        platform="facebook"
        title="SEO Meta Tag Analyzer - Professional Website Analysis"
        description="Get comprehensive SEO insights with visual previews for Google search results and social media platforms. Analyze meta tags, Open Graph data, and more."
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
        url="https://seo-analyzer.example.com"
      />
      <SocialPreview
        platform="twitter"
        title="SEO Meta Tag Analyzer"
        description="Analyze website SEO meta tags with visual previews. Perfect for developers and marketers."
        image="https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=200&fit=crop"
        url="https://seo-analyzer.example.com"
      />
      <SocialPreview
        platform="linkedin"
        title="Professional SEO Analysis Tool"
        description="Enterprise-grade SEO meta tag analyzer with comprehensive reporting and visual previews for all major platforms."
        url="https://seo-analyzer.example.com"
      />
    </div>
  );
}