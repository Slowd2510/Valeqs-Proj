export type ValidationRule = {
  validator: (value: string) => boolean;
  message: string;
};

export function validateInput(value: string, rules: ValidationRule[]): string[] {
  const errors = rules
    .filter(rule => !rule.validator(value))
    .map(rule => rule.message);
  
  return errors;
}

export const commonRules = {
  required: (fieldName: string): ValidationRule => ({
    validator: (value: string) => value.trim().length > 0,
    message: `${fieldName} is required`
  }),
  
  minLength: (fieldName: string, min: number): ValidationRule => ({
    validator: (value: string) => value.length >= min,
    message: `${fieldName} must be at least ${min} characters`
  }),
  
  maxLength: (fieldName: string, max: number): ValidationRule => ({
    validator: (value: string) => value.length <= max,
    message: `${fieldName} must be no more than ${max} characters`
  }),
  
  email: (): ValidationRule => ({
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  }),
  
  minecraftUsername: (): ValidationRule => ({
    validator: (value: string) => /^[a-zA-Z0-9_]{3,16}$/.test(value),
    message: 'Username should be 3-16 characters and contain only letters, numbers, and underscores'
  }),
  
  url: (): ValidationRule => ({
    validator: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Please enter a valid URL'
  })
};