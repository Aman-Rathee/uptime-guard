"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, CheckCircle2, XCircle, AlertCircle, Globe, Zap, Search, Loader2, RefreshCcw } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Website, WebsiteStatus } from "@/lib/types";
import { BACKEND_URL } from "@/lib/config";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const fetchWebsites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/website/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      const formattedData: Website[] = res.data.websites.map((site: Website) => {
        const sortedHistory = site.ticks ? [...site.ticks].reverse() : [];
        const mappedTicks = sortedHistory.map((tick) => ({
          id: tick.id,
          response_time_ms: tick.response_time_ms,
          createdAt: new Date(tick.createdAt),
          status: tick.status as WebsiteStatus,
          region_id: tick.region_id,
          website_id: site.id,
          region: tick.region,
        }));

        return {
          id: site.id,
          url: site.url,
          timeAdded: site.timeAdded,
          ticks: mappedTicks,
        }
      });

      setWebsites(formattedData);
    } catch (err) {
      console.error("Failed to fetch websites", err);
      setError("Failed to load monitor data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signup");
    } else {
      fetchWebsites();
    }
  }, []);

  const stats = useMemo(() => {
    if (!websites.length) return { total: 0, up: 0, down: 0, avgLatency: 0 };

    const total = websites.length;
    const up = websites.filter((w) => {
      const lastTick = w.ticks[w.ticks.length - 1];
      return lastTick?.status === WebsiteStatus.Up;
    }).length;
    const down = total - up;

    const totalLatency = websites.reduce((acc, site) => {
      const lastTick = site.ticks[site.ticks.length - 1];
      return acc + (lastTick?.status === WebsiteStatus.Up ? lastTick.response_time_ms : 0);
    }, 0);
    const avgLatency = up > 0 ? Math.round(totalLatency / up) : 0;

    return { total, up, down, avgLatency };
  }, [websites]);

  const handleAddWebsite = async () => {
    if (!newUrl) return;
    await axios.post(`${BACKEND_URL}/website`, { url: newUrl }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setIsAddOpen(false);
    setNewUrl("");
    fetchWebsites();
  };

  return (
    <div className="bg-slate-950 ">

      <main className="container mx-auto px-4 py-8 space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Monitors Active"
            value={loading ? "-" : `${stats.up}/${stats.total}`}
            icon={<Globe className="h-4 w-4 text-slate-400" />}
            trend={stats.down > 0 ? "Services experiencing issues" : "All systems operational"}
            trendColor={stats.down > 0 ? "text-rose-400" : "text-emerald-400"}
          />
          <StatCard
            title="Avg. Response Time"
            value={loading ? "-" : `${stats.avgLatency}ms`}
            icon={<Zap className="h-4 w-4 text-slate-400" />}
            trend="Global average (24h)"
            trendColor="text-slate-400"
          />
          <StatCard
            title="Current Incidents"
            value={loading ? "-" : stats.down.toString()}
            icon={<AlertCircle className="h-4 w-4 text-slate-400" />}
            trend="Current down monitors"
            trendColor="text-slate-400"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search monitors..."
              className="pl-10 bg-slate-900 border-slate-800 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchWebsites} >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium">
                  <Plus className="mr-2 h-4 w-4" /> Add New Monitor
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Monitor a new URL</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      className="bg-slate-950 border-slate-800"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddWebsite} className="bg-indigo-500 text-slate-50 hover:bg-indigo-600">
                    Start Monitoring
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="text-slate-500">Fetching monitor status...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 border border-dashed border-slate-800 rounded-lg">
            <AlertCircle className="h-10 w-10 text-rose-500" />
            <p className="text-rose-400">{error}</p>
            <Button variant="outline" onClick={fetchWebsites} className="border-slate-700">Try Again</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-12 text-xs font-medium text-slate-500 px-6 uppercase tracking-wider">
              <div className="col-span-4 md:col-span-3">Status & Name</div>
              <div className="hidden md:block col-span-5 text-center">Response Time (Recent)</div>
              <div className="col-span-4 md:col-span-2 text-right">Latest</div>
              <div className="hidden md:block col-span-2 text-right">Status</div>
            </div>

            {websites.map((site) => (
              <MonitorRow key={site.id} site={site} />
            ))}

            {websites.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No monitors found. Add one to get started.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


function StatCard({ title, value, icon, trend, trendColor }: any) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-50">{value}</div>
        <p className={`text-xs ${trendColor} mt-1`}>{trend}</p>
      </CardContent>
    </Card>
  );
}

function MonitorRow({ site }: { site: Website }) {
  const lastTick = site.ticks[site.ticks.length - 1];
  const isUp = lastTick?.status === WebsiteStatus.Up;
  const isUnknown = lastTick?.status === WebsiteStatus.Unknown || !lastTick;
  const chartData = site.ticks.map((t) => ({ value: t.response_time_ms, status: t.status }));
  const gradientIdStroke = `strokeGradient-${site.id}`;
  const gradientIdFill = `fillGradient-${site.id}`;

  return (
    <div className="group relative flex items-center bg-slate-900 hover:bg-slate-700/50 border border-slate-800 rounded-lg p-4 transition-all hover:border-slate-700">

      <div className="grid grid-cols-12 w-full items-center gap-4">
        <div className="col-span-4 md:col-span-3 flex items-center gap-3 overflow-hidden">
          <div className={`relative shrink-0 flex items-center justify-center w-8 h-8 rounded-full 
            ${isUnknown ? 'bg-amber-500/15' : isUp ? 'bg-emerald-500/15' : 'bg-rose-500/15'}`}>

            {isUnknown ? (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            ) : isUp ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <Link href={site.url} target="_blank" className="font-medium text-slate-200 truncate">{site.url.replace('https://', '')}</Link>
            <span className="text-xs text-slate-500 hidden sm:block">Checked 1m ago</span>
          </div>
        </div>

        <div className="hidden md:block col-span-5 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientIdStroke} x1="0" y1="0" x2="1" y2="0">
                  {chartData.map((entry, index) => {
                    const offset = (index / (chartData.length - 1 || 1)) * 100;
                    const color = entry.status === WebsiteStatus.Up ? "#10b981" : "#f43f5e";
                    return <stop key={index} offset={`${offset}%`} stopColor={color} />;
                  })}
                </linearGradient>
                <linearGradient id={gradientIdFill} x1="0" y1="0" x2="1" y2="0">
                  {chartData.map((entry, index) => {
                    const offset = (index / (chartData.length - 1 || 1)) * 100;
                    const color = entry.status === WebsiteStatus.Up ? "#10b981" : "#f43f5e";
                    return <stop key={index} offset={`${offset}%`} stopColor={color} stopOpacity={0.25} />;
                  })}
                </linearGradient>
              </defs>
              <RechartsTooltip cursor={false} content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={`url(#${gradientIdStroke})`}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientIdFill})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-4 md:col-span-2 text-right font-mono text-sm text-slate-300">
          {lastTick ? `${lastTick.response_time_ms}ms` : "-"}
        </div>

        <div className="hidden md:flex col-span-2 justify-end pr-4">
          <Badge variant="outline" className={`
              ${isUnknown ? 'border-amber-500/50 text-amber-500 bg-amber-500/15' :
              isUp ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/15' : 'border-rose-500/50 text-rose-500 bg-rose-500/15'}
           `}>
            {lastTick?.status || "UNKNOWN"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const statusColor = data.status === WebsiteStatus.Up ? "text-emerald-400" : data.status === WebsiteStatus.Down ? "text-rose-400" : "text-amber-400";

    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">Response Time</p>
            <p className="text-sm font-semibold text-slate-200">{data.value ?? (payload[0].value ?? "-")}ms</p>
          </div>
          <div className={`text-xs font-medium ${statusColor}`}>{data.status}</div>
        </div>
      </div>
    );
  }
  return null;
};
