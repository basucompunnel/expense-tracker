"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { User, Mail, Lock } from "lucide-react";
import { useAuth } from "@/src/providers/AuthProvider";
import { FormField } from "@/components/common/form-field";
import { ErrorAlert } from "@/components/common/error-alert";
import { AuthFormLayout } from "@/components/common/auth-form-layout";
import { SubmitButton } from "@/components/common/submit-button";
import { getDisplayError } from "@/src/utils/form";

const validationSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export function RegisterForm() {
  const { register, isLoading, error: authError } = useAuth();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
      if (result.success) {
        router.push("/");
      }
    },
  });

  const displayError = getDisplayError(
    authError,
    formik.errors,
    formik.touched,
    formik.submitCount
  );

  return (
    <AuthFormLayout
      title="Create Account"
      description="Sign up to start tracking your expenses"
      className="py-6"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <ErrorAlert message={displayError} />

        <FormField
          id="fullName"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={<User size={18} />}
          {...formik.getFieldProps("fullName")}
          disabled={isLoading}
          error={formik.errors.fullName}
          touched={formik.touched.fullName}
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          {...formik.getFieldProps("email")}
          disabled={isLoading}
          error={formik.errors.email}
          touched={formik.touched.email}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          {...formik.getFieldProps("password")}
          disabled={isLoading}
          error={formik.errors.password}
          touched={formik.touched.password}
          helperText="Must be at least 6 characters"
        />

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          {...formik.getFieldProps("confirmPassword")}
          disabled={isLoading}
          error={formik.errors.confirmPassword}
          touched={formik.touched.confirmPassword}
        />

        <SubmitButton
          isLoading={isLoading}
          loadingText="Creating account..."
          rounded="xs"
        >
          Create Account
        </SubmitButton>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          href="/auth/login"
          className="font-medium hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthFormLayout>
  );
}
