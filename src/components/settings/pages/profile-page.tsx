"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-[13px] font-medium leading-tight">{label}</label>
      {description && (
        <p className="text-[12px] text-muted-foreground leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  );
}

export function ProfilePage() {
  return (
    <div className="flex flex-col gap-5 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your name, email, and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name">
              <Input id="first-name" defaultValue="Ahmed" />
            </Field>
            <Field label="Last Name">
              <Input id="last-name" defaultValue="Hassan" />
            </Field>
          </div>
          <Field label="Email">
            <Input id="email" type="email" defaultValue="ahmed@woops.ai" />
          </Field>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
              AH
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium">Profile Photo</p>
              <p className="text-[11px] text-muted-foreground">JPG, PNG or GIF, 1MB max</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Field label="Language">
            <Input id="language" defaultValue="English" className="max-w-sm" />
          </Field>
          <Field label="Theme">
            <Input id="theme" defaultValue="System" className="max-w-sm" />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
