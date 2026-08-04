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

export function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your name, email, and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="first-name">
              First Name
            </label>
            <Input id="first-name" defaultValue="Ahmed" className="max-w-sm" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="last-name">
              Last Name
            </label>
            <Input id="last-name" defaultValue="Hassan" className="max-w-sm" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" defaultValue="ahmed@woops.ai" className="max-w-sm" />
          </div>
          <div className="flex items-center gap-3 rounded-xl border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
              AH
            </div>
            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF, 1MB max</p>
            </div>
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
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="language">
              Language
            </label>
            <Input id="language" defaultValue="English" className="max-w-sm" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="theme">
              Theme
            </label>
            <Input id="theme" defaultValue="System" className="max-w-sm" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
