"use client"

import { Button } from "@/components/ui/button"

export default function Navbar() {
    return (
        <header className="border-b border-white/10">
            <nav className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
                <h1 className="text-xl font-bold tracking-tight text-white">
                    Uptime<span className="text-indigo-500">Guard</span>
                </h1>

                <div className="flex items-center gap-4">
                    <Button variant="secondary">Log in</Button>
                    <Button variant="secondary">Sign up</Button>
                </div>
            </nav>
        </header>
    )
}
