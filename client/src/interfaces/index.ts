export interface UserType {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface IncomeType {
  _id: string;
  user_id: string;
  amount: number;
  description: string;
  tag_name:
    | "salary"
    | "bonus"
    | "investment"
    | "dividends"
    | "interest"
    | "rental income"
    | "freelance"
    | "refund"
    | "grant"
    | "pension"
    | "royalties"
    | "others";
  date: string;
  recurring: boolean;
  recurrence_interval: "daily" | "weekly" | "monthly" | "yearly";
}

export interface ExpenseType {
  _id: string;
  user_id: string;
  amount: number;
  description: string;
  tag_name:
    | "food"
    | "school"
    | "transport"
    | "health"
    | "entertainment"
    | "utilities"
    | "shopping"
    | "groceries"
    | "travel"
    | "rent"
    | "subscriptions"
    | "insurance"
    | "personal care"
    | "gifts"
    | "charity"
    | "savings"
    | "investment"
    | "others";
  date: string;
  recurring: boolean;
  recurrence_interval: "daily" | "weekly" | "monthly" | "yearly";
}
