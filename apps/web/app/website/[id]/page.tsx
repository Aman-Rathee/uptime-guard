"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Activity, AlertTriangle, Clock, Globe } from "lucide-react";
import axios from "axios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { StatusHeatmap } from "@/components/StatusHeatmap";
import { BACKEND_URL } from "@/lib/config";


interface MonitorData {
    monitor: {
        id: string;
        name: string;
        url: string;
        interval: number;
        createdAt: string;
    };
    stats: {
        lastCheck: {
            status: "Up" | "Down" | "Unknown";
            latency: number;
            timestamp: string;
        } | null;
        uptime24h: number;
        avgLatency24h: number;
        history: {
            createdAt: string;
            avg_latency: number;
            uptime_rate: number;
            worstStatus: "Up" | "Down" | "Unknown";
        }[];
    };
}

export default function MonitorDetailsPage() {
    const { id } = useParams();
    const [data, setData] = useState<MonitorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/website/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setData(res.data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Could not load monitor details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6 max-w-7xl">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48 bg-slate-700" />
                    <Skeleton className="h-10 w-32 bg-slate-700" />
                </div>
                <div className="flex w-full gap-5">
                    <Skeleton className="h-32 bg-slate-700 w-1/2" /><Skeleton className="h-32 bg-slate-700 w-1/2" />
                </div>
                <Skeleton className="h-64 w-full bg-slate-700" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchData}>Try Again</Button>
            </div>
        );
    }

    const { monitor, stats } = data;
    const currentStatus = stats.lastCheck?.status || "Unknown";
    const isUp = currentStatus === "Up";

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-lg text-gray-200 mt-1">
                        <Globe className="w-5 h-5" />
                        <a href={monitor.url} target="_blank" rel="noreferrer" className="hover:underline hover:text-gray-400 font-semibold transition-colors">
                            {monitor.url}
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">Current Status</p>
                        <p className="text-xs text-muted-foreground">
                            {stats.lastCheck ? format(new Date(stats.lastCheck.timestamp), "h:mm:ss a") : 'No data yet'}
                        </p>
                    </div>

                    <Badge
                        className={`text-md px-4 py-1.5 gap-2 capitalize shadow-sm border ${isUp
                            ? "bg-emerald-700/30 text-emerald-500 border-emerald-500"
                            : currentStatus === "Down"
                                ? "bg-red-700/30 text-red-500 border-red-500"
                                : "bg-amber-700/30 text-amber-500 border-amber-500"
                            }`}
                        variant="outline"
                    >
                        {currentStatus}
                    </Badge>
                </div>
            </div>

            <div className="w-full flex gap-5">
                <Card className="bg-slate-800 border-slate-700 w-1/2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Latency (24h)</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats.avgLatency24h)} ms</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Latest check: <span className="font-medium text-foreground">{stats.lastCheck?.latency || 0} ms</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700 w-1/2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uptime (24h)</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.uptime24h >= 95 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {Number(stats.uptime24h).toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Availability Time
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden bg-slate-800 border-slate-700">
                <CardHeader className="pb-4">
                    <CardTitle>Uptime History</CardTitle>
                    <CardDescription>Status checks over the last 24 hours (20-minute intervals)</CardDescription>
                </CardHeader>
                <CardContent>
                    <StatusHeatmap data={stats.history} />
                </CardContent>
            </Card>
        </div>
    );
}