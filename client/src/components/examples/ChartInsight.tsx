import ChartInsight from '../ChartInsight';

export default function ChartInsightExample() {
  return (
    <div className="p-4 max-w-2xl">
      <ChartInsight
        explanation="This breakdown shows exactly where your 56 working hours go each week and which activities actually make you money."
        insight="You're spending 43% of your time (24 hours) on non-billable activities - that's costing you around £1,560 in potential revenue per week."
        callToAction="Cluster your jobs geographically: Cut travel time from 8 to 5 hours per week and you'll gain 3 billable hours worth £195"
        onActionClick={() => console.log("Taking action to reduce travel time")}
      />
    </div>
  );
}