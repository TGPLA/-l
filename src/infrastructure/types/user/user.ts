export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
