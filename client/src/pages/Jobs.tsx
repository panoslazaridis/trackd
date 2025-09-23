import { useState } from "react";
import JobForm from "@/components/JobForm";
import JobTable from "@/components/JobTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, BarChart3 } from "lucide-react";

// Mock jobs data - TODO: remove mock functionality
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
  {
    id: "5",
    customerName: "Lisa Anderson",
    jobType: "Boiler Installation",
    revenue: 1200.00,
    hours: 16,
    status: "Completed" as const,
    date: "2024-01-12",
    hourlyRate: 75.00,
  },
];

export default function Jobs() {
  const [jobs, setJobs] = useState(mockJobs);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const handleAddJob = (jobData: any) => {
    console.log("Adding new job:", jobData);
    const newJob = {
      ...jobData,
      id: String(Date.now()),
      revenue: parseFloat(jobData.revenue),
      hours: parseFloat(jobData.hours),
      hourlyRate: parseFloat(jobData.revenue) / parseFloat(jobData.hours),
    };
    setJobs(prev => [newJob, ...prev]);
    setIsFormOpen(false);
  };

  const handleEditJob = (job: any) => {
    console.log("Edit job:", job);
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleDeleteJob = (jobId: string) => {
    console.log("Delete job:", jobId);
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleBulkImport = () => {
    console.log("Bulk import jobs via AI");
    // TODO: Implement AI bulk import functionality
  };

  const completedJobs = jobs.filter(job => job.status === 'Completed');
  const totalRevenue = completedJobs.reduce((sum, job) => sum + job.revenue, 0);
  const totalHours = completedJobs.reduce((sum, job) => sum + job.hours, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Jobs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your job history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkImport} data-testid="button-bulk-import">
            <Upload className="w-4 h-4 mr-2" />
            AI Bulk Import
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-job">
                <Plus className="w-4 h-4 mr-2" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">
                  {editingJob ? "Edit Job" : "Add New Job"}
                </DialogTitle>
              </DialogHeader>
              <JobForm
                onSubmit={handleAddJob}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingJob(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue (Completed)</p>
              <p className="text-2xl font-bold text-foreground">£{totalRevenue.toFixed(0)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card border border-card-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Rate/Hour</p>
              <p className="text-2xl font-bold text-foreground">
                £{totalHours > 0 ? (totalRevenue / totalHours).toFixed(0) : '0'}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Jobs Management */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Job List</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <JobTable
            jobs={jobs}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
          />
        </TabsContent>
        
        <TabsContent value="pipeline">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Quoted', 'Booked', 'In Progress', 'Completed'].map(status => {
              const statusJobs = jobs.filter(job => job.status === status);
              return (
                <div key={status} className="bg-card border border-card-border rounded-lg p-4">
                  <h3 className="font-heading font-semibold mb-3 flex items-center justify-between">
                    {status}
                    <span className="text-sm bg-muted px-2 py-1 rounded-full">
                      {statusJobs.length}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {statusJobs.map(job => (
                      <div key={job.id} className="bg-muted/30 rounded-lg p-3 hover-elevate">
                        <p className="font-medium text-sm">{job.customerName}</p>
                        <p className="text-xs text-muted-foreground">{job.jobType}</p>
                        <p className="text-sm font-medium text-chart-1">£{job.revenue.toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}