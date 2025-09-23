import CompetitorCard from '../CompetitorCard';

export default function CompetitorCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <CompetitorCard
        name="Elite Plumbing Services"
        location="Central Manchester"
        services={["Emergency Plumbing", "Bathroom Installation", "Boiler Repair", "Pipe Fitting"]}
        averageRate={65}
        yourRate={50}
        phone="0161 123 4567"
        website="www.eliteplumbing.co.uk"
        rating={4.8}
        reviewCount={147}
        onViewDetails={() => console.log("View Elite Plumbing details")}
      />
      
      <CompetitorCard
        name="Quick Fix Handyman"
        location="North Manchester"
        services={["General Repairs", "Electrical Work", "Plumbing"]}
        averageRate={45}
        yourRate={50}
        phone="0161 987 6543"
        rating={4.2}
        reviewCount={89}
        onViewDetails={() => console.log("View Quick Fix details")}
      />
      
      <CompetitorCard
        name="Premium Home Solutions"
        location="South Manchester" 
        services={["HVAC Installation", "Kitchen Renovation", "Bathroom Design", "Emergency Service"]}
        averageRate={75}
        yourRate={50}
        website="www.premiumhome.co.uk"
        rating={4.9}
        reviewCount={203}
        onViewDetails={() => console.log("View Premium Home details")}
      />
    </div>
  );
}