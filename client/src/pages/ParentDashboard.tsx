import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import WalletConnect from "@/components/WalletConnect";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

// Form schema for creating a child account
const createChildSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  spendLimit: z.coerce.number().min(100, "Spend limit must be at least 100 cents ($1)"),
});

// Form schema for creating a task
const createTaskSchema = z.object({
  childId: z.coerce.number().min(1, "Please select a child"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  rewardAmount: z.coerce.number().min(1, "Reward must be at least 1 cent"),
  dueDate: z.string().optional(),
});

const ParentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [location, setLocation] = useLocation();
  
  // Get parent by wallet address
  const { data: parent, isLoading: parentLoading } = useQuery({
    queryKey: ['/api/parents/wallet', address],
    queryFn: () => 
      address ? 
      apiRequest(`/api/parents/wallet/${address}`, { on401: "returnNull" }) : 
      Promise.resolve(null),
    enabled: !!address,
  });
  
  // Fetch children
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['/api/parents', parent?.id, 'children'],
    queryFn: () => apiRequest(`/api/parents/${parent?.id}/children`, { on401: "returnNull" }),
    enabled: !!parent?.id,
  });
  
  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/parents', parent?.id, 'tasks'],
    queryFn: () => apiRequest(`/api/parents/${parent?.id}/tasks`, { on401: "returnNull" }),
    enabled: !!parent?.id,
  });
  
  // Create parent mutation
  const createParentMutation = useMutation({
    mutationFn: (parentData: any) => apiRequest('/api/parents', { 
      method: 'POST',
      body: JSON.stringify(parentData),
      headers: { 'Content-Type': 'application/json' }
    }, { on401: "returnNull" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents/wallet', address] });
      toast({
        title: "Account created!",
        description: "Your parent account has been set up successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating account",
        description: error.message || "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Create child mutation
  const createChildMutation = useMutation({
    mutationFn: (childData: any) => apiRequest('/api/children', { 
      method: 'POST',
      body: JSON.stringify(childData),
      headers: { 'Content-Type': 'application/json' }
    }, { on401: "returnNull" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents', parent?.id, 'children'] });
      setAddChildOpen(false);
      toast({
        title: "Child account created!",
        description: "The child account has been created successfully.",
      });
      childForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating child account",
        description: error.message || "Failed to create child account. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => apiRequest('/api/tasks', { 
      method: 'POST',
      body: JSON.stringify(taskData),
      headers: { 'Content-Type': 'application/json' }
    }, { on401: "returnNull" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents', parent?.id, 'tasks'] });
      setAddTaskOpen(false);
      toast({
        title: "Task created!",
        description: "The task has been assigned successfully.",
      });
      taskForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating task",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Approve task mutation
  const approveTaskMutation = useMutation({
    mutationFn: (taskId: number) => apiRequest(`/api/tasks/${taskId}/approve`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, { on401: "returnNull" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents', parent?.id, 'tasks'] });
      setIsTaskDetailOpen(false);
      toast({
        title: "Task approved!",
        description: "The task has been approved and allowance awarded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error approving task",
        description: error.message || "Failed to approve task. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Reject task mutation
  const rejectTaskMutation = useMutation({
    mutationFn: (taskId: number) => apiRequest(`/api/tasks/${taskId}/reject`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, { on401: "returnNull" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents', parent?.id, 'tasks'] });
      setIsTaskDetailOpen(false);
      toast({
        title: "Task rejected",
        description: "The task has been rejected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error rejecting task",
        description: error.message || "Failed to reject task. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Child form
  const childForm = useForm<z.infer<typeof createChildSchema>>({
    resolver: zodResolver(createChildSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      spendLimit: 1000, // Default $10.00
    },
  });
  
  // Task form
  const taskForm = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      childId: 0,
      title: "",
      description: "",
      rewardAmount: 100, // Default $1.00
      dueDate: "",
    },
  });
  
  // If no wallet is connected, show wallet connection
  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-950 to-slate-900">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-white">Connect Your Wallet</CardTitle>
              <CardDescription className="text-center text-slate-300">
                Connect your wallet to access the Parent Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnect />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Handle parent account creation
  const handleCreateParentAccount = () => {
    if (address) {
      createParentMutation.mutate({
        username: `parent_${address.slice(2, 8)}`,
        password: `pass_${address.slice(2, 10)}`,
        name: "Parent",
        email: "",
        walletAddress: address,
      });
    }
  };
  
  // Handle child form submission
  const onChildSubmit = (values: z.infer<typeof createChildSchema>) => {
    if (parent?.id) {
      createChildMutation.mutate({
        ...values,
        parentId: parent.id,
        allowanceBalance: 0
      });
    }
  };
  
  // Handle task form submission
  const onTaskSubmit = (values: z.infer<typeof createTaskSchema>) => {
    if (parent?.id) {
      createTaskMutation.mutate({
        ...values,
        parentId: parent.id,
        status: "pending"
      });
    }
  };
  
  // If wallet is connected but no parent account found, show registration
  if (address && !parentLoading && !parent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-950 to-slate-900">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-white">Welcome to AllowanceApp</CardTitle>
              <CardDescription className="text-center text-slate-300">
                Create a parent account to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-slate-800 p-4 text-center">
                <p className="text-sm text-slate-300 mb-2">Connected Wallet</p>
                <p className="text-md font-medium text-white">{address}</p>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600"
                onClick={handleCreateParentAccount}
                disabled={createParentMutation.isPending}
              >
                {createParentMutation.isPending ? "Creating account..." : "Create Parent Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Get stats
  const pendingTasksCount = tasks.filter(task => task.status === "pending").length;
  const completedTasksCount = tasks.filter(task => task.status === "completed").length;
  const approvedTasksCount = tasks.filter(task => task.status === "approved").length;
  
  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };
  
  // View task details
  const viewTaskDetails = (task: any) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Parent Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your children's accounts, tasks, and allowances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-600">{parent?.name?.charAt(0) || "P"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{parent?.name || "Parent"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
              {address}
            </p>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Children
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {children.length}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sub accounts registered
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pendingTasksCount}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tasks awaiting completion
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Completed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {completedTasksCount}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tasks awaiting review
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                The latest task and allowance activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                  Loading recent activity...
                </div>
              ) : tasks.length === 0 ? (
                <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                  No recent activity to display. Create a task to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 rounded-full ${
                          task.status === 'completed' ? 'bg-yellow-500' : 
                          task.status === 'approved' ? 'bg-green-500' : 
                          task.status === 'rejected' ? 'bg-red-500' : 
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        task.status === 'completed' ? 'warning' : 
                        task.status === 'approved' ? 'success' : 
                        task.status === 'rejected' ? 'destructive' : 
                        'default'
                      }>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setActiveTab("tasks")}
              >
                View All Tasks
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="children" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Child Accounts</h2>
            <Dialog open={addChildOpen} onOpenChange={setAddChildOpen}>
              <DialogTrigger asChild>
                <Button>Add Child</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a new child account</DialogTitle>
                  <DialogDescription>
                    Create a sub-account for your child with custom spend limits.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...childForm}>
                  <form onSubmit={childForm.handleSubmit(onChildSubmit)} className="space-y-4">
                    <FormField
                      control={childForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter child's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={childForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Username for login" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={childForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={childForm.control}
                      name="spendLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Spend Limit (cents)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            {formatCurrency(field.value)} per day maximum spending
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setAddChildOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createChildMutation.isPending}>
                        {createChildMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {childrenLoading ? (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              Loading children accounts...
            </div>
          ) : children.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No child accounts found. Add a child to get started.
                </p>
                <Button onClick={() => setAddChildOpen(true)}>
                  Add Child
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child: any) => (
                <Card key={child.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarFallback className="bg-blue-800">{child.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {child.name}
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      @{child.username}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(child.allowanceBalance || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Daily Spend Limit</p>
                        <p className="text-lg">{formatCurrency(child.spendLimit || 0)}</p>
                      </div>
                      {child.walletAddress && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Sub Account Address</p>
                          <p className="text-xs truncate">{child.walletAddress}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("tasks")}>
                      Manage Tasks
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Tasks</h2>
            <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
              <DialogTrigger asChild>
                <Button>Assign New Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign a new task</DialogTitle>
                  <DialogDescription>
                    Create a task for your child to complete for a reward.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...taskForm}>
                  <form onSubmit={taskForm.handleSubmit(onTaskSubmit)} className="space-y-4">
                    <FormField
                      control={taskForm.control}
                      name="childId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            >
                              <option value={0}>Select a child</option>
                              {children.map((child: any) => (
                                <option key={child.id} value={child.id}>{child.name}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taskForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taskForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Task description (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taskForm.control}
                      name="rewardAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Amount (cents)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            {formatCurrency(field.value)} reward upon completion
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taskForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setAddTaskOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTaskMutation.isPending}>
                        {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 max-w-md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {renderTaskList(tasks)}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              {renderTaskList(tasks.filter((task: any) => task.status === "pending"))}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              {renderTaskList(tasks.filter((task: any) => task.status === "completed"))}
            </TabsContent>
            
            <TabsContent value="approved" className="mt-4">
              {renderTaskList(tasks.filter((task: any) => task.status === "approved"))}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
      
      {/* Task Detail Dialog */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="max-w-3xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
                <DialogDescription>
                  Task details and approval
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant={
                        selectedTask.status === 'completed' ? 'warning' : 
                        selectedTask.status === 'approved' ? 'success' : 
                        selectedTask.status === 'rejected' ? 'destructive' : 
                        'default'
                      }>
                        {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Reward</p>
                      <p>{formatCurrency(selectedTask.rewardAmount)}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Assigned To</p>
                      <p>{children.find((c: any) => c.id === selectedTask.childId)?.name || 'Unknown'}</p>
                    </div>
                    
                    {selectedTask.dueDate && (
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Due Date</p>
                        <p>{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Created</p>
                      <p>{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    {selectedTask.completedAt && (
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Completed</p>
                        <p>{new Date(selectedTask.completedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedTask.description && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-1">Description</h3>
                      <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  {selectedTask.proofImageUrl ? (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Proof of Completion</h3>
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={selectedTask.proofImageUrl} 
                          alt="Proof of completion" 
                          className="w-full object-cover"
                          style={{ maxHeight: "300px" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full border rounded-md bg-gray-50 dark:bg-gray-800 p-8">
                      <p className="text-center text-gray-500 dark:text-gray-400">
                        No proof of completion submitted yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedTask.status === "completed" && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => rejectTaskMutation.mutate(selectedTask.id)}
                    disabled={rejectTaskMutation.isPending}
                  >
                    {rejectTaskMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button 
                    onClick={() => approveTaskMutation.mutate(selectedTask.id)}
                    disabled={approveTaskMutation.isPending}
                  >
                    {approveTaskMutation.isPending ? "Approving..." : "Approve & Award Allowance"}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
  
  // Helper function to render task list
  function renderTaskList(taskList: any[]) {
    if (tasksLoading) {
      return (
        <div className="py-6 text-center text-gray-500 dark:text-gray-400">
          Loading tasks...
        </div>
      );
    }
    
    if (taskList.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No tasks found. Assign a new task to get started.
            </p>
            <Button onClick={() => setAddTaskOpen(true)}>
              Assign New Task
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {taskList.map((task: any) => {
          const childName = children.find((c: any) => c.id === task.childId)?.name || 'Unknown';
          
          return (
            <Card key={task.id} className="overflow-hidden">
              <div className="flex">
                <div className={`w-2 ${
                  task.status === 'completed' ? 'bg-yellow-500' : 
                  task.status === 'approved' ? 'bg-green-500' : 
                  task.status === 'rejected' ? 'bg-red-500' : 
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{task.title}</CardTitle>
                      <Badge variant={
                        task.status === 'completed' ? 'warning' : 
                        task.status === 'approved' ? 'success' : 
                        task.status === 'rejected' ? 'destructive' : 
                        'default'
                      }>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <span>Assigned to: {childName}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Reward: {formatCurrency(task.rewardAmount)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{task.description}</p>
                    )}
                    {task.proofImageUrl && (
                      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                        Proof submitted
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 dark:bg-gray-800/50 justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {task.dueDate && `Due: ${new Date(task.dueDate).toLocaleDateString()} | `}
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewTaskDetails(task)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }
};

export default ParentDashboard;