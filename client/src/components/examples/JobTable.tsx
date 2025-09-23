import JobTable from '../JobTable';

// Mock data for demonstration
const mockJobs = [
  {
    id: "1",
    customerName: "Sarah Matthews",
    jobType: "Emergency Plumbing",
    revenue: 320.00,
    hours: 4.5,
    status: "Completed" as const,
    date: "2024-01-15",
    hourlyRate: 71.11,
  },
  {
    id: "2", 
    customerName: "David Wilson",
    jobType: "Kitchen Renovation",
    revenue: 2400.00,
    hours: 32,
    status: "In Progress" as const,
    date: "2024-01-10",
    hourlyRate: 75.00,
  },
  {
    id: "3",
    customerName: "Emma Johnson",
    jobType: "Bathroom Repair",
    revenue: 450.00,
    hours: 6,
    status: "Booked" as const,
    date: "2024-01-20",
    hourlyRate: 75.00,
  },
  {
    id: "4",
    customerName: "Michael Brown",
    jobType: "HVAC Maintenance", 
    revenue: 180.00,
    hours: 3,
    status: "Quoted" as const,
    date: "2024-01-18",
    hourlyRate: 60.00,
  },
];

export default function JobTableExample() {
  return (
    <div className="p-4">
      <JobTable
        jobs={mockJobs}
        onEditJob={(job) => console.log("Edit job:", job)}
        onDeleteJob={(jobId) => console.log("Delete job:", jobId)}
      />
    </div>
  );
}