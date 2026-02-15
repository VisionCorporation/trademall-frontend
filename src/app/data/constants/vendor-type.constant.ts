export const VendorTypes = [
  {
    name: 'Individual',
    value: 'individual',
    description:
      'Register as an individual if you sell under your personal name without a registered business. Basic ID details are required.',
  },
  {
    name: 'Business',
    value: 'business',
    description:
      'Register as a business if you operate under a legally registered name. Upload your registration certificate and provide official details for verification.',
  },
] as const;
