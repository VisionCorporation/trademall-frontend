export interface SignupData {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface OtpSuccessResponse {
  userId: string;
  success: boolean;
  email: string;
  message: string;
}
