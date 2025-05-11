import { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import WalletConnect from "@/components/WalletConnect";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAccount } from "wagmi";
import SpendLimits from "@/components/SpendLimits";

// Form schema for submitting task proof
const submitProofSchema = z.object({
  proofImageUrl: z.string().url("Please enter a valid image URL"),
});

// Form schema for spending allowance
const spendAllowanceSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive").min(1, "Minimum spend is 1 cent"),
  description: z.string().min(3, "Description must be at least 3 characters"),
});

const ChildDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
  const [isSpendDialogOpen, setIsSpendDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [location, setLocation] = useLocation();
  
  // Get child by wallet address
  const { data: child, isLoading: childLoading } = useQuery({
    queryKey: ['/api/children/wallet', address],
    queryFn: () => 
      address ? 
      apiRequest('GET', `/api/children/wallet/${address}`) : 
      Promise.resolve(null),
    enabled: !!address,
  });
  
  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/children', child?.id, 'tasks'],
    queryFn: () => apiRequest('GET', `/api/children/${child?.id}/tasks`),
    enabled: !!child?.id,
  });
  
  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/children', child?.id, 'transactions'],
    queryFn: () => apiRequest('GET', `/api/children/${child?.id}/transactions`),
    enabled: !!child?.id,
  });
  
  // Submit proof mutation
  const submitProofMutation = useMutation({
    mutationFn: ({ taskId, proofImageUrl }: { taskId: number, proofImageUrl: string }) => 
      apiRequest('PATCH', `/api/tasks/${taskId}/proof`, { proofImageUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children', child?.id, 'tasks'] });
      setIsProofDialogOpen(false);
      toast({
        title: "Proof submitted!",
        description: "Your task completion proof has been submitted for review.",
      });
      proofForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting proof",
        description: error.message || "Failed to submit proof. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Spend allowance mutation
  const spendAllowanceMutation = useMutation({
    mutationFn: (spendData: any) => apiRequest('POST', '/api/transactions', {
        ...spendData,
        childId: child?.id,
        amount: -spendData.amount, // Negative amount for spending
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children', child?.id, 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/children/wallet', address] });
      setIsSpendDialogOpen(false);
      toast({
        title: "Allowance spent!",
        description: "Your transaction has been recorded.",
      });
      spendForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error spending allowance",
        description: error.message || "Failed to spend allowance. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Proof form
  const proofForm = useForm<z.infer<typeof submitProofSchema>>({
    resolver: zodResolver(submitProofSchema),
    defaultValues: {
      proofImageUrl: "",
    },
  });
  
  // Spend form
  const spendForm = useForm<z.infer<typeof spendAllowanceSchema>>({
    resolver: zodResolver(spendAllowanceSchema),
    defaultValues: {
      amount: 100, // $1.00
      description: "",
    },
  });
  
  // If no wallet is connected, show wallet connection
  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-md bg-gradient-to-br from-indigo-950 to-purple-900">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-white">Connect Your Wallet</CardTitle>
              <CardDescription className="text-center text-indigo-200">
                Connect your wallet to access your dashboard
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
  
  // If wallet is connected but no child account found
  if (address && !childLoading && !child) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-md bg-gradient-to-br from-indigo-950 to-purple-900">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-white">Account Not Found</CardTitle>
              <CardDescription className="text-center text-indigo-200">
                No child account was found for this wallet address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-indigo-900/50 p-4 text-center">
                <p className="text-sm text-indigo-200 mb-2">Connected Wallet</p>
                <p className="text-md font-medium text-white break-all">{address}</p>
              </div>
              <Alert variant="info" className="bg-blue-900/50 text-white border-blue-500">
                <AlertTitle>Need to link your account?</AlertTitle>
                <AlertDescription>
                  If you already have an account, you need to link it to your wallet address.
                  Go to the Parent Dashboard to link your existing child account to this wallet.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  onClick={() => setLocation("/")}
                >
                  Go to Home
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={() => setLocation("/parent")}
                >
                  Go to Parent Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };
  
  // Get stats
  const pendingTasksCount = tasks.filter(task => task.status === "pending").length;
  const completedTasksCount = tasks.filter(task => task.status === "completed").length;
  const approvedTasksCount = tasks.filter(task => task.status === "approved").length;
  
  // Calculate total earned
  const totalEarned = transactions
    .filter((tx: any) => tx.amount > 0)
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  
  // Calculate total spent
  const totalSpent = transactions
    .filter((tx: any) => tx.amount < 0)
    .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);
  
  // Open proof submission dialog
  const openProofDialog = (task: any) => {
    setSelectedTask(task);
    setIsProofDialogOpen(true);
  };
  
  // Handle proof form submission
  const onProofSubmit = (values: z.infer<typeof submitProofSchema>) => {
    if (selectedTask?.id) {
      submitProofMutation.mutate({
        taskId: selectedTask.id,
        proofImageUrl: values.proofImageUrl,
      });
    }
  };
  
  // Handle spend form submission
  const onSpendSubmit = (values: z.infer<typeof spendAllowanceSchema>) => {
    if (child?.id) {
      // Check if amount is within balance
      if (values.amount > (child.allowanceBalance || 0)) {
        toast({
          title: "Insufficient balance",
          description: `You only have ${formatCurrency(child.allowanceBalance || 0)} available.`,
          variant: "destructive",
        });
        return;
      }
      
      // Check if amount is within spend limit
      if (values.amount > (child.spendLimit || 0)) {
        toast({
          title: "Exceeds spend limit",
          description: `Your daily spend limit is ${formatCurrency(child.spendLimit || 0)}.`,
          variant: "destructive",
        });
        return;
      }
      
      spendAllowanceMutation.mutate(values);
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            My Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track your tasks, allowance, and spending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-indigo-600">{child?.name?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{child?.name || "Child"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
              {address}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Balance</CardTitle>
            <CardDescription className="text-indigo-100">Available to spend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(child?.allowanceBalance || 0)}
            </div>
            <div className="text-xs mt-1 text-indigo-200">
              Daily spending limit: {formatCurrency(child?.spendLimit || 0)}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-white text-indigo-600 hover:bg-indigo-100"
              onClick={() => setIsSpendDialogOpen(true)}
            >
              Spend Allowance
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tasks Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Pending</span>
                <span>{pendingTasksCount}</span>
              </div>
              <Progress value={pendingTasksCount ? 100 : 0} className="h-2 bg-gray-200" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Completed</span>
                <span>{completedTasksCount}</span>
              </div>
              <Progress value={completedTasksCount ? 100 : 0} className="h-2 bg-gray-200" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Approved</span>
                <span>{approvedTasksCount}</span>
              </div>
              <Progress value={approvedTasksCount ? 100 : 0} className="h-2 bg-gray-200" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setActiveTab("tasks")}
            >
              View Tasks
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Spend Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {child?.walletAddress ? (
              <SpendLimits 
                account={child.walletAddress}
                isDashboard={true}
              />
            ) : (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                Wallet not fully configured
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Summary</CardTitle>
              <CardDescription>
                Your allowance earnings and spending overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Earned</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-green-600 dark:text-green-500">{formatCurrency(totalEarned)}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">from tasks</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Spent</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-red-600 dark:text-red-500">{formatCurrency(totalSpent)}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">on purchases</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest tasks and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 && transactions.length === 0 ? (
                <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                  No recent activity to display.
                </div>
              ) : (
                <div className="space-y-4">
                  {[...tasks, ...transactions]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((item: any) => {
                      // Determine if this is a task or transaction
                      const isTask = 'title' in item;
                      
                      return (
                        <div key={`${isTask ? 'task' : 'tx'}-${item.id}`} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-10 rounded-full ${
                              isTask ? 
                                item.status === 'completed' ? 'bg-yellow-500' :
                                item.status === 'approved' ? 'bg-green-500' :
                                item.status === 'rejected' ? 'bg-red-500' :
                                'bg-blue-500'
                              : item.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-medium">
                                {isTask ? item.title : item.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {isTask ? (
                            <Badge variant={
                              item.status === 'completed' ? 'warning' :
                              item.status === 'approved' ? 'success' :
                              item.status === 'rejected' ? 'destructive' :
                              'default'
                            }>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Badge>
                          ) : (
                            <span className={`font-medium ${item.amount > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                              {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Tasks</h2>
          </div>
          
          <Tabs defaultValue="pending" className="w-full">
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
        
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Transactions</h2>
          </div>
          
          {transactionsLoading ? (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No transactions found. Start using your allowance!
                </p>
                <Button onClick={() => setIsSpendDialogOpen(true)}>
                  Spend Allowance
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction: any) => (
                <Card key={transaction.id} className="overflow-hidden">
                  <div className="flex">
                    <div className={`w-2 ${transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="flex-1">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle>{transaction.description}</CardTitle>
                          <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        <CardDescription>
                          {new Date(transaction.createdAt).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      {transaction.transactionHash && (
                        <CardContent className="pb-2">
                          <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <line x1="3" y1="9" x2="21" y2="9" />
                              <line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                            <span className="truncate">{transaction.transactionHash}</span>
                          </div>
                        </CardContent>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Task Proof Dialog */}
      <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
        <DialogContent>
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>Submit Proof of Completion</DialogTitle>
                <DialogDescription>
                  Upload an image link as proof for completing "{selectedTask.title}"
                </DialogDescription>
              </DialogHeader>
              
              <Form {...proofForm}>
                <form onSubmit={proofForm.handleSubmit(onProofSubmit)} className="space-y-4">
                  <FormField
                    control={proofForm.control}
                    name="proofImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/my-image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Upload your image to an image hosting service and paste the URL here
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsProofDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitProofMutation.isPending}>
                      {submitProofMutation.isPending ? "Submitting..." : "Submit Proof"}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Spend Allowance Dialog */}
      <Dialog open={isSpendDialogOpen} onOpenChange={setIsSpendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spend Allowance</DialogTitle>
            <DialogDescription>
              Use your allowance for purchases and track your spending
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
            <AlertTitle className="text-blue-800 dark:text-blue-300">Current Balance</AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              You have {formatCurrency(child?.allowanceBalance || 0)} available to spend.
              <br />
              Your daily spending limit is {formatCurrency(child?.spendLimit || 0)}.
            </AlertDescription>
          </Alert>
          
          <Form {...spendForm}>
            <form onSubmit={spendForm.handleSubmit(onSpendSubmit)} className="space-y-4">
              <FormField
                control={spendForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (cents)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      {formatCurrency(field.value)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={spendForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="What are you spending on?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsSpendDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={spendAllowanceMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {spendAllowanceMutation.isPending ? "Processing..." : "Spend Allowance"}
                </Button>
              </div>
            </form>
          </Form>
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
              No tasks found in this category.
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {taskList.map((task: any) => (
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-600 dark:text-green-500">
                        {formatCurrency(task.rewardAmount)}
                      </span>
                      <Badge variant={
                        task.status === 'completed' ? 'warning' : 
                        task.status === 'approved' ? 'success' : 
                        task.status === 'rejected' ? 'destructive' : 
                        'default'
                      }>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {task.description && (
                    <CardDescription>
                      {task.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-2">
                  {task.dueDate && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
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
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                    {task.completedAt && ` | Completed: ${new Date(task.completedAt).toLocaleDateString()}`}
                  </div>
                  {task.status === "pending" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openProofDialog(task)}
                    >
                      Submit Proof
                    </Button>
                  )}
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
};

export default ChildDashboard;