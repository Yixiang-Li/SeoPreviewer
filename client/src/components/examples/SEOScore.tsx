import SEOScore from '../SEOScore';

export default function SEOScoreExample() {
  const mockIssues = [
    { type: 'error' as const, message: 'Meta description too short (45 chars)' },
    { type: 'warning' as const, message: 'Title could be more descriptive' },
    { type: 'success' as const, message: 'Open Graph tags properly configured' }
  ];

  return (
    <SEOScore
      score={72}
      issues={mockIssues}
    />
  );
}