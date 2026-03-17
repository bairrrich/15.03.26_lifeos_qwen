import { EmptyState } from './empty-state';
import {
    Target,
    Calendar,
    Plus,
    FileText,
    BarChart3,
    Clock,
    Star,
    Dumbbell,
    Utensils,
    Heart,
    BookOpen,
    Sparkles,
    Zap,
    TrendingUp,
    CreditCard,
    Pill
} from 'lucide-react';

interface EmptyStateVariantProps {
    onAction?: () => void;
    className?: string;
}

/**
 * Specialized EmptyState components for different modules and use cases
 */

export function EmptyGoals({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Target}
            title="Нет активных целей"
            description="Создайте свою первую цель и начните отслеживать прогресс"
            actionLabel="Создать цель"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyCompletedGoals({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Star}
            title="Пока нет завершённых целей"
            description="Завершите свои цели и увидите их здесь"
            className={className}
        />
    );
}

export function EmptyHabits({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Calendar}
            title="Нет привычек"
            description="Добавьте привычки, которые хотите отслеживать ежедневно"
            actionLabel="Создать привычку"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyWorkouts({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Dumbbell}
            title="Нет тренировок"
            description="Начните свою программу тренировок"
            actionLabel="Добавить тренировку"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyNutrition({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Utensils}
            title="Нет записей питания"
            description="Ведите дневник питания для отслеживания КБЖУ"
            actionLabel="Добавить приём пищи"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyHealth({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Heart}
            title="Нет данных о здоровье"
            description="Добавьте метрики для отслеживания самочувствия"
            actionLabel="Добавить данные"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyMind({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={BookOpen}
            title="Нет материалов"
            description="Добавьте книги, курсы или статьи для развития"
            actionLabel="Добавить материал"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyBeauty({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Sparkles}
            title="Нет продуктов"
            description="Добавьте косметические продукты в свою коллекцию"
            actionLabel="Добавить продукт"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyRoutines({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Calendar}
            title="Нет активных рутин"
            description="Создайте уходовые рутины для регулярного ухода"
            actionLabel="Создать рутину"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyAutomations({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Zap}
            title="Нет правил автоматизации"
            description="Создайте правила для автоматических действий"
            actionLabel="Создать правило"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyFinance({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={CreditCard}
            title="Нет транзакций"
            description="Добавьте свои первые финансовые операции"
            actionLabel="Добавить транзакцию"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyAnalytics({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={BarChart3}
            title="Недостаточно данных"
            description="Добавьте больше данных для аналитики"
            className={className}
        />
    );
}

export function EmptySleep({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Clock}
            title="Нет данных о сне"
            description="Запишите время сна для отслеживания качества отдыха"
            actionLabel="Добавить сон"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyRecipes({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={FileText}
            title="Нет рецептов"
            description="Создайте или импортируйте рецепты блюд"
            actionLabel="Добавить рецепт"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyPrograms({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={TrendingUp}
            title="Нет программ тренировок"
            description="Создайте программу для достижения целей"
            actionLabel="Создать программу"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyExercises({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Dumbbell}
            title="Нет упражнений"
            description="Добавьте упражнения в свою библиотеку"
            actionLabel="Добавить упражнение"
            onAction={onAction}
            className={className}
        />
    );
}

export function EmptyFoods({ onAction, className }: EmptyStateVariantProps) {
    return (
        <EmptyState
            icon={Pill}
            title="Нет продуктов"
            description="Добавьте продукты в базу данных питания"
            actionLabel="Добавить продукт"
            onAction={onAction}
            className={className}
        />
    );
}