import MetaTagDetails from '../MetaTagDetails';

export default function MetaTagDetailsExample() {
  const mockTags = [
    {
      name: 'title',
      content: 'SEO Meta Tag Analyzer - Professional Website Analysis Tool',
      status: 'good' as const
    },
    {
      name: 'description',
      content: 'Analyze website SEO meta tags with visual Google and social media previews.',
      status: 'warning' as const,
      recommendation: 'Consider expanding to 150-160 characters for better SERP display'
    },
    {
      name: 'keywords',
      content: '',
      status: 'missing' as const,
      recommendation: 'While not used by Google, keywords can help with other search engines'
    },
    {
      name: 'og:title',
      content: 'SEO Meta Tag Analyzer',
      status: 'good' as const
    },
    {
      name: 'og:description',
      content: 'Professional SEO analysis tool with visual previews',
      status: 'good' as const
    },
    {
      name: 'og:image',
      content: '',
      status: 'missing' as const,
      recommendation: 'Add an Open Graph image (1200x630px recommended) for better social media sharing'
    }
  ];

  return (
    <MetaTagDetails tags={mockTags} />
  );
}