'use client';

import { useDashboardStats, useFinanceChartData, useHabitsChartData } from '@/core/analytics/use-analytics';
import { useWeeklyWorkoutStats } from '@/modules/workouts/hooks';
import { useAccounts, useInvestments } from '@/modules/finance/hooks';
import {
  StatsCards,
  QuickActions,
  FinanceChart,
  HabitsChart,
  WorkoutCard,
  ExpensesPieChart,
} from '@/features/dashboard/components';
import { PageTransition, StaggerContainer } from '@/ui/components/page-transition';

export default function DashboardPage() {
  const { data: stats } = useDashboardStats(30);
  const { data: financeData, isLoading: financeLoading } = useFinanceChartData(6);
  const { data: habitsData, isLoading: habitsLoading } = useHabitsChartData();
  const { data: weeklyWorkoutStats } = useWeeklyWorkoutStats(Date.now());
  const { data: accounts = [] } = useAccounts();
  const { data: investments = [] } = useInvestments();

  // Расчет Net Worth
  const totalBankBalance = accounts
    .filter((a) => a.type !== 'investment' && a.type !== 'crypto')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalInvestmentValue = investments.reduce((sum, inv) => {
    const price = inv.current_price || inv.purchase_price;
    return sum + price * inv.quantity;
  }, 0);

  const netWorth = totalBankBalance + totalInvestmentValue;

  return (
    <PageTransition variant="slide">
      <StaggerContainer className="space-y-6">
        <StatsCards stats={stats} netWorth={netWorth} investmentValue={totalInvestmentValue} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <FinanceChart data={financeData} isLoading={financeLoading} />
          <HabitsChart data={habitsData} isLoading={habitsLoading} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <WorkoutCard
            totalWorkouts={weeklyWorkoutStats?.totalWorkouts}
            totalDuration={weeklyWorkoutStats?.totalDuration}
            avgRating={weeklyWorkoutStats?.avgRating}
          />
          <QuickActions />
          <ExpensesPieChart />
        </div>
      </StaggerContainer>
    </PageTransition>
  );
}

