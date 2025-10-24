import { create } from 'zustand';
import { Task, TaskFilters, TaskStatus } from '@/types';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
  runningCount: number;

  // Actions
  setTasks: (tasks: Task[]) => void;
  setSelectedTask: (task: Task | null) => void;
  setFilters: (filters: TaskFilters) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setPendingCount: (count: number) => void;
  setRunningCount: (count: number) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  filters: {},
  isLoading: false,
  error: null,
  pendingCount: 0,
  runningCount: 0,

  setTasks: (tasks) => {
    const pendingCount = tasks.filter(task => task.status === TaskStatus.PENDING).length;
    const runningCount = tasks.filter(task => task.status === TaskStatus.RUNNING).length;
    set({
      tasks,
      pendingCount,
      runningCount
    });
  },

  setSelectedTask: (task) => {
    set({ selectedTask: task });
  },

  setFilters: (filters) => {
    set({ filters });
  },

  addTask: (task) => {
    set((state) => {
      // Check if task already exists
      const existingIndex = state.tasks.findIndex(t => t.taskId === task.taskId);
      let newTasks;

      if (existingIndex !== -1) {
        // Update existing task
        newTasks = [...state.tasks];
        newTasks[existingIndex] = task;
      } else {
        // Add new task to the beginning
        newTasks = [task, ...state.tasks];
      }

      // Recalculate counts
      const pendingCount = newTasks.filter(t => t.status === TaskStatus.PENDING).length;
      const runningCount = newTasks.filter(t => t.status === TaskStatus.RUNNING).length;

      return {
        tasks: newTasks,
        pendingCount,
        runningCount,
        selectedTask: state.selectedTask?.taskId === task.taskId ? task : state.selectedTask
      };
    });
  },

  updateTask: (taskId, updates) => {
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.taskId === taskId ? { ...task, ...updates } : task
      );

      // Recalculate counts
      const pendingCount = newTasks.filter(t => t.status === TaskStatus.PENDING).length;
      const runningCount = newTasks.filter(t => t.status === TaskStatus.RUNNING).length;

      return {
        tasks: newTasks,
        pendingCount,
        runningCount,
        selectedTask:
          state.selectedTask?.taskId === taskId
            ? { ...state.selectedTask, ...updates }
            : state.selectedTask,
      };
    });
  },

  removeTask: (taskId) => {
    set((state) => {
      const newTasks = state.tasks.filter((task) => task.taskId !== taskId);

      // Recalculate counts
      const pendingCount = newTasks.filter(t => t.status === TaskStatus.PENDING).length;
      const runningCount = newTasks.filter(t => t.status === TaskStatus.RUNNING).length;

      return {
        tasks: newTasks,
        pendingCount,
        runningCount,
        selectedTask:
          state.selectedTask?.taskId === taskId ? null : state.selectedTask,
      };
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  setPendingCount: (count) => {
    set({ pendingCount: count });
  },

  setRunningCount: (count) => {
    set({ runningCount: count });
  },
}));