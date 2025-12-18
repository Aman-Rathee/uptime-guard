"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BACKEND_URL } from "@/lib/config";


export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) router.push("/");
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError(null);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${BACKEND_URL}/auth/signin`, {
                email: formData.email,
                password: formData.password
            });

            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
                window.dispatchEvent(new Event("token"));
                router.push("/");
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || "Invalid credentials. Please try again.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center pt-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl z-10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold">Log in</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@gmail.com"
                                className="bg-slate-950 border-slate-800"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="bg-slate-950 border-slate-800"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="text-right -mt-2">
                            <Link href="#" className="text-xs text-indigo-500 hover:text-indigo-400">
                                Forgot password?
                            </Link>
                        </div>
                        {error && (
                            <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-500 py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-slate-50 font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</>
                            ) : (
                                <>Sign In<ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col text-center text-sm text-slate-500 border-t border-slate-800/50">
                    <div>
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-indigo-500 hover:text-indigo-400 font-medium underline-offset-4 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}