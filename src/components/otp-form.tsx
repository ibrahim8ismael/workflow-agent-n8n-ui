"use client"

import { useState } from "react"
import { useEffect } from "react"
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Loader2Icon } from "lucide-react"
import { requestOtp, verifyOtp, fetchMe } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth-store"

const RESEND_COOLDOWN_SECONDS = 30;
const otpSlotClassName =
	"size-9 bg-white text-base font-semibold text-slate-900 shadow-sm data-[active=true]:border-primary data-[active=true]:ring-primary/20 sm:size-12";

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
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (resendCooldown === 0) return;

    const timeout = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [resendCooldown]);

  const handleVerify = async (code: string) => {
    if (!email || code.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const { accessToken } = await verifyOtp(email, code);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleVerify(otp);
  };

  const handleResend = async () => {
    if (!email || isResending || resendCooldown > 0) return;
    setIsResending(true);
    setResent(false);
    setError(null);
    try {
      await requestOtp(email);
      setResent(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
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

	const resendLabel =
		isResending
			? "Resending..."
			: resendCooldown > 0
				? `Resend in ${resendCooldown}s`
				: "Resend code";

  return (
    <div className={cn("flex flex-col gap-7", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col gap-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Secure sign in
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Check your inbox
            </h1>
            <FieldDescription className="mx-auto max-w-sm leading-relaxed">
              {email ? (
                <>
                  We sent a 6-digit verification code to{" "}
                  <span className="font-medium text-slate-900">{email}</span>.
                </>
              ) : (
                "Enter the verification code we sent to your email."
              )}
            </FieldDescription>
          </div>
          <Field className="flex flex-col items-center justify-center gap-3">
            <FieldLabel htmlFor="otp" className="sr-only">One-Time Password</FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              containerClassName="w-full justify-center"
              aria-invalid={Boolean(error)}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError(null);
                if (value.length === 6) {
                  void handleVerify(value);
                }
              }}
              disabled={isSubmitting}
            >
              <InputOTPGroup>
                <InputOTPSlot className={cn(otpSlotClassName, error && "border-destructive data-[active=true]:border-destructive data-[active=true]:ring-destructive/20")} index={0} />
                <InputOTPSlot className={cn(otpSlotClassName, error && "border-destructive data-[active=true]:border-destructive data-[active=true]:ring-destructive/20")} index={1} />
                <InputOTPSlot className={cn(otpSlotClassName, error && "border-destructive data-[active=true]:border-destructive data-[active=true]:ring-destructive/20")} index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot className={cn(otpSlotClassName, error && "border-destructive data-[active=true]:border-destructive data-[active=true]:ring-destructive/20")} index={3} />
                <InputOTPSlot className={cn(otpSlotClassName, error && "border-destructive data-[active=true]:border-destructive data-[active=true]:ring-destructive/20")} index={4} />
                <InputOTPSlot className={cn(otpSlotClassName, error && "border-destructive data-[active=true]:border-destructive data-[active=true]:ring-destructive/20")} index={5} />
              </InputOTPGroup>
            </InputOTP>
          </Field>
          {error && (
            <FieldError role="alert" className="text-center">{error}</FieldError>
          )}
          <Field>
            <CustomButton
              type="submit"
              className="h-11 w-full gap-2 rounded-xl"
              disabled={isSubmitting || otp.length !== 6}
              showArrow={!isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
              {isSubmitting ? "Verifying..." : "Verify"}
            </CustomButton>
          </Field>
        </FieldGroup>
      </form>
      <div className="flex flex-col items-center gap-2 text-center">
        <FieldDescription>
          Didn&apos;t receive the code?
        </FieldDescription>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0 || !email}
          className="cursor-pointer text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {resendLabel}
        </button>
        {resent && resendCooldown > 0 && (
          <p className="text-xs text-emerald-600" role="status">
            A new code was sent. Check your inbox.
          </p>
        )}
      </div>
    </div>
  )
}
