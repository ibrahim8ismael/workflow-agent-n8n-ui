import { OtpForm } from "@/components/otp-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default async function OtpVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthShell>
      <OtpForm email={email} />
    </AuthShell>
  )
}
