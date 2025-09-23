import InsightCard from '../InsightCard';

export default function InsightCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <InsightCard
        type="pricing"
        priority="high"
        title="Undercharging for Emergency Calls"
        description="You're pricing emergency plumbing calls £15/hour below market rate"
        impact="£2,400 additional monthly revenue"
        action="Increase Emergency Rate to £65/hour"
        onTakeAction={() => console.log("Pricing action taken")}
      />
      <InsightCard
        type="customer"
        priority="medium"
        title="High-Value Customer Opportunity"
        description="Sarah M. generates 3x more revenue than average - prioritize her projects"
        impact="Strengthen key relationship"
        action="Schedule Follow-up Call"
        onTakeAction={() => console.log("Customer action taken")}
      />
      <InsightCard
        type="efficiency"
        priority="low"
        title="Peak Season Planning"
        description="January is your highest revenue month - plan accordingly"
        impact="Optimize resource allocation"
        action="Review January Schedule"
        onTakeAction={() => console.log("Efficiency action taken")}
      />
    </div>
  );
}