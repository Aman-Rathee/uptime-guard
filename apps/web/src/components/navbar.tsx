"use client"

import { Button } from "@/components/ui/button"
import { Activity, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [hasToken, setHasToken] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();

    const checkToken = () => {
        const token = localStorage.getItem("token");
        setHasToken(!!token);
    };

    useEffect(() => {
        checkToken();
        window.addEventListener("token", checkToken);
        return () => {
            window.removeEventListener("token", checkToken);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setHasToken(false);
        router.push("/");
    };

    return (
        <header className="border-b border-border">
            <nav className="container mx-auto flex items-center justify-between py-4 px-14">
                <div className="flex items-center space-x-3">
                    <Link href='/' className="bg-indigo-600 p-2 rounded-lg">
                        <Activity className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">Uptime<span className="text-indigo-500">Guard</span></h1>
                        <p className="text-xs text-gray-400">Monitor your websites 24/7</p>
                    </div>

                    <Link className="pl-12  text-lg hover:text-slate-300 transition-colors" href='/dashboard'> Dashboard</Link>

                </div>


                <div className="flex items-center gap-10">
                    {!hasToken && (
                        <div className="flex items-center gap-4">
                            <Link href="/login">Log in</Link>
                            <Link href="/signup">Sign up</Link>
                        </div>
                    )}

                    <div className="relative" onClick={() => setShowMenu(!showMenu)} onMouseLeave={() => setShowMenu(false)} >
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-semibold cursor-pointer">
                            <User />
                        </div>
                        {hasToken && showMenu && (
                            <div className="absolute right-2 top-10 bg-slate-900 border rounded-lg shadow-lg p-2 w-28 text-sm animate-fade-in">
                                <Button
                                    onClick={handleLogout}
                                    className="w-full hover:bg-red-500 hover:text-white rounded-md"
                                >
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}
