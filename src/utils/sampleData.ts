/**
 * Sample data for demonstration
 */

import type { ChartDataPoint } from "@/types";
import type { BaseEntity } from "@/types";

/**
 * Sample task entity
 */
export interface SampleTask extends BaseEntity {
  title: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
}

/**
 * Sample metrics for dashboard
 */
export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

/**
 * Generate sample tasks
 */
export function generateSampleTasks(): Omit<SampleTask, keyof BaseEntity>[] {
  return [
    { title: "Set up project structure", status: "completed", priority: "high" },
    { title: "Design database schema", status: "completed", priority: "high" },
    { title: "Implement authentication", status: "in-progress", priority: "high" },
    { title: "Create API endpoints", status: "in-progress", priority: "medium" },
    { title: "Build dashboard UI", status: "pending", priority: "medium" },
    { title: "Add data visualization", status: "pending", priority: "low" },
    { title: "Write documentation", status: "pending", priority: "low" },
    { title: "Set up CI/CD pipeline", status: "pending", priority: "medium" },
  ];
}

/**
 * Calculate metrics from tasks
 */
export function calculateMetrics(tasks: SampleTask[]): DashboardMetrics {
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
    inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
    pendingTasks: tasks.filter((t) => t.status === "pending").length,
  };
}

/**
 * Get status distribution for pie chart
 */
export function getStatusDistribution(tasks: SampleTask[]): ChartDataPoint[] {
  const metrics = calculateMetrics(tasks);
  return [
    { name: "Completed", value: metrics.completedTasks, color: "#16a34a" },
    { name: "In Progress", value: metrics.inProgressTasks, color: "#2563eb" },
    { name: "Pending", value: metrics.pendingTasks, color: "#6b7280" },
  ];
}

/**
 * Get priority distribution for bar chart
 */
export function getPriorityDistribution(tasks: SampleTask[]): ChartDataPoint[] {
  return [
    { name: "High", value: tasks.filter((t) => t.priority === "high").length },
    { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length },
    { name: "Low", value: tasks.filter((t) => t.priority === "low").length },
  ];
}
