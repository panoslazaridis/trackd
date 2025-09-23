import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Job {
  id: string;
  customerName: string;
  jobType: string;
  revenue: number;
  hours: number;
  status: "Quoted" | "Booked" | "In Progress" | "Completed";
  date: string;
  hourlyRate: number;
}

interface JobTableProps {
  jobs?: Job[];
  onEditJob?: (job: Job) => void;
  onDeleteJob?: (jobId: string) => void;
  className?: string;
}

const statusConfig = {
  "Quoted": { color: "bg-muted text-muted-foreground", label: "Quoted" },
  "Booked": { color: "bg-chart-2 text-chart-2-foreground", label: "Booked" },
  "In Progress": { color: "bg-chart-1 text-chart-1-foreground", label: "In Progress" },
  "Completed": { color: "bg-chart-1 text-chart-1-foreground", label: "Completed" },
};

export default function JobTable({ jobs = [], onEditJob, onDeleteJob, className = "" }: JobTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.jobType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (job: Job) => {
    console.log("Edit job:", job.id);
    onEditJob?.(job);
  };

  const handleDelete = (jobId: string) => {
    console.log("Delete job:", jobId);
    onDeleteJob?.(jobId);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CardTitle className="font-heading">Job History</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[200px]"
                data-testid="input-search-jobs"
              />
            </div>
            {/* Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]" data-testid="select-status-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Quoted">Quoted</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Rate/Hr</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== "all" ? "No jobs match your filters" : "No jobs recorded yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id} className="hover-elevate">
                    <TableCell className="font-medium" data-testid={`text-customer-${job.id}`}>
                      {job.customerName}
                    </TableCell>
                    <TableCell>{job.jobType}</TableCell>
                    <TableCell className="text-right font-medium">
                      £{Number(job.revenue || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{job.hours}h</TableCell>
                    <TableCell className="text-right">
                      £{Number(job.hourlyRate || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusConfig[job.status].color}`}>
                        {statusConfig[job.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(job.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-job-menu-${job.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(job)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(job.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}