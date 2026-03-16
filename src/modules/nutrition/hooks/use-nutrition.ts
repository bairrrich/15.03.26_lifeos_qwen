'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import {
  FoodService,
  MealService,
  RecipeService,
  NutritionLogService,
  NutritionGoalService,
} from '../services';
import type { Food, Meal, Recipe, NutritionLog, NutritionGoal } from '../entities';

const foodService = new FoodService();
const mealService = new MealService();
const recipeService = new RecipeService();
const nutritionLogService = new NutritionLogService();
const nutritionGoalService = new NutritionGoalService();

// Foods
export function useFoods() {
  return useQuery({
    queryKey: ['foods'],
    queryFn: () => foodService.getAll(),
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Food,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => foodService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });
}

export function useSearchFoods(query: string) {
  return useQuery({
    queryKey: ['foods', 'search', query],
    queryFn: () => (query ? foodService.searchByName(query) : Promise.resolve([])),
    enabled: query.length > 0,
  });
}

// Meals
export function useMeals() {
  return useQuery({
    queryKey: ['meals'],
    queryFn: () => mealService.getAll(),
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Meal,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => mealService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
}

// Recipes
export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: () => recipeService.getAll(),
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Recipe,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => recipeService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

// Nutrition Logs
export function useNutritionLogs(date?: number) {
  return useQuery({
    queryKey: ['nutrition-logs', date],
    queryFn: () => (date ? nutritionLogService.getByDate(date) : Promise.resolve([])),
    enabled: !!date,
  });
}

export function useDailyNutrition(date?: number) {
  return useQuery({
    queryKey: ['nutrition-daily', date],
    queryFn: () =>
      date
        ? nutritionLogService.getDailyTotals(date)
        : Promise.resolve({
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
        }),
    enabled: !!date,
  });
}

export function useCreateNutritionLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        NutritionLog,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => nutritionLogService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-logs'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition-daily'] });
    },
  });
}

// Nutrition Goals
export function useNutritionGoal() {
  return useQuery({
    queryKey: ['nutrition-goal'],
    queryFn: () => nutritionGoalService.getCurrentGoal(),
  });
}

export function useCreateNutritionGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        NutritionGoal,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => nutritionGoalService.create({ ...data, user_id: getCurrentUserId() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-goal'] });
    },
  });
}
