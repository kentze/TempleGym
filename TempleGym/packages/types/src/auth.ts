import type { UserProfile } from './user';

export interface OtpRequestBody {
  email: string;
}

export interface OtpVerifyBody {
  email: string;
  code: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}
