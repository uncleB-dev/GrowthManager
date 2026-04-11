export interface UserProfile {
    uid: string;
    email: string | null;
    leaders: string[];
    monthly_goal_amount: number;
    monthly_goal_cases: number;
    createdAt: string;
}

export interface DailyLog {
    uid: string;
    date: string;
    work_status: string;
    call_target: number;
    call_actual: number;
    performance_amount: number;
    performance_cases: number;
    notable_outcomes: NotableOutcome[];
    updatedAt: string;
}

export interface NotableOutcome {
    name: string;
    age: string;
    memo: string;
}

export interface Connection {
    id: string;
    leaderEmail: string;
    memberUid: string;
    memberEmail: string;
    memberName: string;
    status: 'pending' | 'accepted' | 'rejected' | 'removed';
    createdAt: string;
}
