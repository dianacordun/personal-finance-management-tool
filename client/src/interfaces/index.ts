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
  tag_id: string;
  tag_name: string;
  createdAt: string;
  updatedAt: string;
}
