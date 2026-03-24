import { FormikErrors, FormikTouched } from "formik";

export function getDisplayError(
  authError: string | null,
  errors: FormikErrors<any>,
  touched: FormikTouched<any>,
  submitCount: number
): string {
  // Always show API errors
  if (authError) {
    return authError;
  }

  // Only show validation errors after user tries to submit
  if (submitCount > 0 && Object.keys(errors).length > 0) {
    return Object.values(errors)[0] as string;
  }

  return "";
}
