export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string | null;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  msg?: string;
}
