import { NextRequest } from 'next/server';
import { getAuthenticatedSupabase, handleDatabaseError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/lib/api-response';

/**
 * GET /api/finance/analytics/summary
 * 
 * Get financial summary (income, expenses, balance)
 * 
 * Query params:
 * - date_from: start date (ISO string, default: 30 days ago)
 * - date_to: end date (ISO string, default: now)
 */
export async function GET(request: NextRequest) {
    // Check authentication
    const { supabase, userId, error: authError } = await getAuthenticatedSupabase();

    if (authError) {
        return authError;
    }

    const searchParams = request.nextUrl.searchParams;

    // Default: last 30 days
    const dateFrom = searchParams.get('date_from')
        ? new Date(searchParams.get('date_from')!).getTime()
        : Date.now() - 30 * 24 * 60 * 60 * 1000;

    const dateTo = searchParams.get('date_to')
        ? new Date(searchParams.get('date_to')!).getTime()
        : Date.now();

    try {
        // Get income for period
        const { data: incomeData, error: incomeError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId!)
            .eq('type', 'income')
            .gte('date', dateFrom)
            .lte('date', dateTo);

        if (incomeError) {
            return handleDatabaseError('income fetch');
        }

        // Get expenses for period
        const { data: expenseData, error: expenseError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', userId!)
            .eq('type', 'expense')
            .gte('date', dateFrom)
            .lte('date', dateTo);

        if (expenseError) {
            return handleDatabaseError('expense fetch');
        }

        // Calculate totals
        const totalIncome = incomeData?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const totalExpenses = expenseData?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const balance = totalIncome - totalExpenses;

        // Get account balances
        const { data: accounts, error: accountsError } = await supabase
            .from('accounts')
            .select('balance')
            .eq('user_id', userId!);

        if (accountsError) {
            return handleDatabaseError('accounts fetch');
        }

        const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) || 0;

        // Calculate daily average
        const daysDiff = Math.ceil((dateTo - dateFrom) / (24 * 60 * 60 * 1000));
        const avgDailyExpenses = daysDiff > 0 ? totalExpenses / daysDiff : 0;

        const summary = {
            period: {
                date_from: dateFrom,
                date_to: dateTo,
                days: daysDiff,
            },
            totals: {
                income: totalIncome,
                expenses: totalExpenses,
                balance: balance,
                total_balance: totalBalance,
            },
            averages: {
                daily_expenses: Math.round(avgDailyExpenses * 100) / 100,
            },
            transaction_counts: {
                income: incomeData?.length || 0,
                expenses: expenseData?.length || 0,
            },
        };

        return successResponse(summary);
    } catch (err) {
        return errorResponse('Failed to calculate summary', 500, 'CALCULATION_ERROR');
    }
}

