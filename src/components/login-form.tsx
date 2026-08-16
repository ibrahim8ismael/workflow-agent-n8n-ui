"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import CustomButton from "@/components/shared/Button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2Icon } from "lucide-react"
import { requestOtp } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await requestOtp(email.trim());
      router.push(`/otp-verify?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-7", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sign in or sign up
            </h1>
            <FieldDescription className="mx-auto max-w-xs leading-relaxed">
              Start creating with Woops
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel className="text-foreground" htmlFor="email">Email address</FieldLabel>
            <Input
              id="email"
              type="email"
              className="h-11 rounded-xl border-border bg-card px-4 shadow-sm focus-visible:ring-primary/20"
              placeholder="you@company.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
          {error && (
            <FieldError role="alert" className="-mt-2">{error}</FieldError>
          )}
          <Field>
            <CustomButton
              type="submit"
              disabled={isSubmitting}
              showArrow={!isSubmitting}
              aria-busy={isSubmitting}
              className="h-11 w-full gap-2 rounded-xl"
            >
              {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
              {isSubmitting ? "Sending code..." : "Continue with email"}
            </CustomButton>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-2 text-center leading-relaxed">
        By continuing, you agree to our{" "}
        <a className="font-medium text-foreground underline underline-offset-4 hover:text-primary" href="/legal/terms">
          Terms of Service
        </a>{" "}
        and{" "}
        <a className="font-medium text-foreground underline underline-offset-4 hover:text-primary" href="/legal/privacy">
          Privacy Policy
        </a>.
      </FieldDescription>
    </div>
  )
}
