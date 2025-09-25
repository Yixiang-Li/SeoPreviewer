import URLInput from '../URLInput';

export default function URLInputExample() {
  return (
    <URLInput
      onAnalyze={(url) => console.log('Analyzing URL:', url)}
      isLoading={false}
    />
  );
}