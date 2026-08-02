"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { GalleryVerticalEndIcon, Loader2Icon } from "lucide-react"
import { requestOtp, verifyOtp, fetchMe } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth-store"

export function OtpForm({
  email,
  className,
  ...props
}: React.ComponentProps<"div"> & { email?: string }) {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || otp.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const { accessToken } = await verifyOtp(email, otp);
      const user = await fetchMe();
      signIn(user, accessToken);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.statusCode === 401
            ? "Invalid code. Please try again."
            : err.message,
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      await requestOtp(email);
      setResent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not resend the code. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">Woops</span>
            </a>
            <h1 className="text-xl font-bold">Verify your account</h1>
            <FieldDescription>
              {email ? (
                <>
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                </>
              ) : (
                "We have sent a verification code to your email."
              )}
            </FieldDescription>
          </div>
          <Field className="flex flex-col items-center justify-center">
            <FieldLabel htmlFor="otp" className="sr-only">One-Time Password</FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError(null);
              }}
              disabled={isSubmitting}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </Field>
          {error && (
            <FieldError role="alert" className="text-center">{error}</FieldError>
          )}
          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting || otp.length !== 6}>
              {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
              {isSubmitting ? "Verifying…" : "Verify & sign in"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || !email}
          className="cursor-pointer underline underline-offset-4 hover:text-primary disabled:opacity-50"
        >
          {isResending ? "Resending…" : resent ? "Resent — check your inbox" : "Resend"}
        </button>
      </FieldDescription>
    </div>
  )
}
