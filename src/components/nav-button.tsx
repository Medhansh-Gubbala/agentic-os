"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { Button, NeonButton } from "@/components/ds";

// ponytail: two thin wrappers instead of a generic "as" prop — Button/NeonButton
// have different prop shapes, so a union "as" prop is more code than this.

export function ButtonLink({ href, ...props }: { href: string } & Omit<ComponentProps<typeof Button>, "onClick">) {
  const router = useRouter();
  return <Button {...props} onClick={() => router.push(href)} />;
}

export function NeonButtonLink({ href, ...props }: { href: string } & Omit<ComponentProps<typeof NeonButton>, "onClick">) {
  const router = useRouter();
  return <NeonButton {...props} onClick={() => router.push(href)} />;
}
