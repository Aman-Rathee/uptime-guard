"use client"

import { Button } from "@/components/ui/button"
import { Activity, User } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
    return (
        <header className="border-b border-border">
            <nav className="container mx-auto flex items-center justify-between py-4 px-8">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Uptime<span className="text-indigo-500">Guard</span></h1>
                        <p className="text-xs text-gray-400">Monitor your websites 24/7</p>
                    </div>

                    <Link className="pl-12  text-lg hover:text-slate-300 transition-colors" href='/dashboard'> Dashboard</Link>

                </div>


                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button >Log in</Button>
                        <Button >Sign up</Button>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-semibold">
                        <User />
                    </div>
                </div>
            </nav>
        </header>
    )
}
