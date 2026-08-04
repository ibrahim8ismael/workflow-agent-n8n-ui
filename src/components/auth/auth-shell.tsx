import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
	return (
		<main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-secondary px-4 py-8 sm:px-6">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-accent/70 blur-3xl"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-40 -right-32 size-96 rounded-full bg-primary/10 blur-3xl"
			/>

			<div className="relative w-full max-w-md">
				<div className="mb-7 flex justify-center">
					<Link href="/" aria-label="Woops home">
						<Logo className="h-8 w-auto" />
					</Link>
				</div>
				<div className="rounded-2xl bg-transparent p-6 sm:p-8">
					{children}
				</div>
			</div>
		</main>
	);
}
