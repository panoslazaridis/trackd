import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import JobForm from "@/components/JobForm";
import JobTable from "@/components/JobTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";

// Job status type for consistency
type JobStatus = "Quoted" | "Booked" | "In Progress" | "Completed" | "Cancelled";

export default function Jobs() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch jobs from API
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: () => fetch('/api/jobs').then(res => res.json()),
  });
  
  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) throw new Error('Failed to create job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({ title: "Success", description: "Job created successfully" });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create job", 
        variant: "destructive" 
      });
      console.error('Error creating job:', error);
    },
  });
  
  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, ...jobData }: any) => {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) throw new Error('Failed to update job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({ title: "Success", description: "Job updated successfully" });
      setIsFormOpen(false);
      setEditingJob(null);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update job", 
        variant: "destructive" 
      });
      console.error('Error updating job:', error);
    },
  });
  
  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({ title: "Success", description: "Job deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to delete job", 
        variant: "destructive" 
      });
      console.error('Error deleting job:', error);
    },
  });

  const handleAddJob = (jobData: any) => {
    console.log("Adding new job:", jobData);
    const processedJobData = {
      ...jobData,
      revenue: parseFloat(jobData.revenue).toString(),
      hours: parseFloat(jobData.hours).toString(),
      hourlyRate: (parseFloat(jobData.revenue) / parseFloat(jobData.hours)).toString(),
      date: new Date(jobData.date),
    };
    createJobMutation.mutate(processedJobData);
  };

  const handleEditJob = (job: any) => {
    console.log("Edit job:", job);
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleUpdateJob = (jobData: any) => {
    if (!editingJob) return;
    
    console.log("Updating job:", jobData);
    const processedJobData = {
      id: editingJob.id,
      ...jobData,
      revenue: parseFloat(jobData.revenue).toString(),
      hours: parseFloat(jobData.hours).toString(),
      hourlyRate: (parseFloat(jobData.revenue) / parseFloat(jobData.hours)).toString(),
      date: new Date(jobData.date),
    };
    updateJobMutation.mutate(processedJobData);
  };

  const handleDeleteJob = (jobId: string) => {
    console.log("Delete job:", jobId);
    deleteJobMutation.mutate(jobId);
  };

  const handleBulkImport = () => {
    console.log("Bulk import jobs via AI");
    // TODO: Implement AI bulk import functionality
  };

  const completedJobs = jobs.filter((job: Job) => job.status === 'Completed');
  const totalRevenue = completedJobs.reduce((sum: number, job: Job) => {
    const revenue = typeof job.revenue === 'string' ? parseFloat(job.revenue) : job.revenue;
    return sum + (isNaN(revenue) ? 0 : revenue);
  }, 0);
  const totalHours = completedJobs.reduce((sum: number, job: Job) => {
    const hours = typeof job.hours === 'string' ? parseFloat(job.hours) : job.hours;
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0);

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
                onSubmit={editingJob ? handleUpdateJob : handleAddJob}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingJob(null);
                }}
                // Note: JobForm component doesn't support initialData prop yet
                // TODO: Update JobForm to support editing with initialData
                // initialData={editingJob || undefined}
                // isLoading={editingJob ? updateJobMutation.isPending : createJobMutation.isPending}
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
            {(['Quoted', 'Booked', 'In Progress', 'Completed'] as JobStatus[]).map(status => {
              const statusJobs = jobs.filter((job: any) => job.status === status);
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
                        <p className="text-sm font-medium text-chart-1">£{Number(job.revenue || 0).toFixed(0)}</p>
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