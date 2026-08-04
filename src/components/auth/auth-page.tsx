import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";

export function AuthPage() {
	return (
		<AuthShell>
			<LoginForm />
		</AuthShell>
	);
}
