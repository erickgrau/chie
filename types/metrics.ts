export interface DashboardMetrics {
    netWorth: {
        total: number;
        change: number; // Percentage change
    };
    savingsRate: {
        rate: number;
        target: number;
    };
    cashFlow: {
        income: number;
        expenses: number;
        surplus: number;
    };
    dti: {
        ratio: number;
        status: 'good' | 'warning' | 'bad';
    };
    emergencyFund: {
        months: number;
        targetMonths: number;
    };
    investments: {
        total: number;
        roi: number;
    };
    creditScore: {
        score: number;
        provider: string;
    };
    subscriptions: {
        // Keeping this from original for layout balance
        total: number;
        count: number;
    };
}
