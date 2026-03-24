"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/src/providers/AuthProvider";
import { FormField } from "@/components/common/form-field";
import { ErrorAlert } from "@/components/common/error-alert";
import { AuthFormLayout } from "@/components/common/auth-form-layout";
import { SubmitButton } from "@/components/common/submit-button";
import { getDisplayError } from "@/src/utils/form";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export function LoginForm() {
  const { login, isLoading, error: authError } = useAuth();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await login({
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
      title="Welcome Back"
      description="Sign in to your expense tracker account"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <ErrorAlert message={displayError} />

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
        />

        <SubmitButton
          rounded="xs"
          isLoading={isLoading}
          loadingText="Signing in..."
        >
          Sign In
        </SubmitButton>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link href="/auth/register" className="font-medium hover:underline">
          Create one
        </Link>
      </div>
    </AuthFormLayout>
  );
}
