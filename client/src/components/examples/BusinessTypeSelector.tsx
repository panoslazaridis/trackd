import BusinessTypeSelector, { BusinessType } from '../BusinessTypeSelector';

export default function BusinessTypeSelectorExample() {
  const handleSelect = (businessType: BusinessType) => {
    console.log("Selected business type:", businessType);
    alert(`You selected: ${businessType.name}`);
  };

  const handleSkip = () => {
    console.log("User skipped business type selection");
    alert("Skipped business type selection");
  };

  return (
    <div className="min-h-screen bg-background">
      <BusinessTypeSelector
        onSelect={handleSelect}
        onSkip={handleSkip}
      />
    </div>
  );
}