export interface UserProfile {
    uid: string;
    email: string;
    name?: string;
    nickname?: string;
    role: 'agent' | 'leader';
    leaders: string[];
    monthly_goal_amount?: number;
    monthly_goal_cases?: number;
    current_status?: string;
    current_call_target?: number;
    createdAt: string;
}

export interface DailyLog {
    uid: string;
    date: string;
    work_status: string;
    call_target: number;
    call_attempts: number;
    call_actual: number;
    missed_calls: number;
    memo: string;
    updatedAt: string;
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
