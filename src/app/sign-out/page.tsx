"use client"

import { SignOutButton } from "@clerk/nextjs"

export default function SignOutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <h2 className="mb-4 text-xl">Sign out</h2>
        <p className="mb-4">Click to sign out and view the sign-in page.</p>
        <SignOutButton>
          <button className="rounded bg-neutral-900 px-4 py-2 text-white">Sign out</button>
        </SignOutButton>
      </div>
    </main>
  )
}
