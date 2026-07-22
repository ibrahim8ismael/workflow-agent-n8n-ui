import type React from "react";

export const LogoIcon = (props: Omit<React.ComponentProps<"img">, "src" | "alt">) => (
	<img src="/logo/logo.svg" alt="Logo Icon" {...props} />
);

export const Logo = (props: Omit<React.ComponentProps<"img">, "src" | "alt">) => (
	<img src="/logo/logo.svg" alt="Logo" {...props} />
);
