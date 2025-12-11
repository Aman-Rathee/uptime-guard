"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, AlertCircle, Globe, Zap, Search, Loader2, RefreshCcw, Clock, MapPin } from "lucide-react";
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

      setWebsites(res.data.dashboard);

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
    const up = websites.filter(w => w?.status === WebsiteStatus.Up).length;
    const down = total - up;

    const totalLatency = websites.reduce((acc, site) => {
      return acc + (site?.status === WebsiteStatus.Up ? site.responseTimeMs : 0);
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
    <div>

      <main className="container mx-auto px-4 py-8 space-y-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search monitors..."
              className="pl-10 bg-slate-900 border-slate-800 focus-visible:ring-indigo-600 focus-visible:ring-2"
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
                      className="bg-slate-950 border-slate-800 focus-visible:ring-2"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
              {websites.map(website => (
                <WebsiteCard key={website.id} website={website} />
              ))}
            </div>

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


const WebsiteCard = ({ website }: { website: Website }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case WebsiteStatus.Up:
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/60';
      case WebsiteStatus.Down:
        return 'bg-rose-500/15 text-rose-600 border-rose-500/60';
      default:
        return 'bg-amber-500/15 text-amber-600 border-amber-500/60';
    }
  };

  const getResponseTimeColor = (ms: number, status: WebsiteStatus) => {
    switch (status) {
      case WebsiteStatus.Up:
        if (ms < 250) return 'text-emerald-500';
        if (ms < 500) return 'text-amber-500';
      case WebsiteStatus.Down:
        return 'text-rose-500';
      default:
        return 'text-amber-500';
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  return (
    <Card className="bg-slate-900">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Globe className="w-5 h-5 text-gray-300 shrink-0" />
            <CardTitle className="text-lg truncate">
              <Link href={website.url} target="_blank">{website.url.replace('https://', '')}</Link>
            </CardTitle>
          </div>
          <Badge variant="outline" className={`${getStatusColor(website.status)}`}>
            <span className="flex items-center gap-1">
              {website.status}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between gap-8">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-400">Response Time</p>
              <p className={`font-semibold ${getResponseTimeColor(website.responseTimeMs, website.status)}`}>
                {website.responseTimeMs}ms
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-400">Region</p>
              <p className="font-semibold text-gray-200">Us-East</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Added</span>
            <span className="text-gray-300">{formatDate(website.timeAdded)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Last Checked</span>
            <span className="text-gray-300">{formatDate(website.checkedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};