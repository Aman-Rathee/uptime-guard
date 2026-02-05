"use client";

import { format, subMinutes, startOfMinute } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HistoryPoint {
    createdAt: string;
    avg_latency: number;
    uptime_rate: number;
    worstStatus: "Up" | "Down" | "Unknown";
}

export function StatusHeatmap({ data }: { data: HistoryPoint[] }) {
    const slots = [];

    for (let i = 0; i < data.length; i++) {
        slots.push(subMinutes(new Date(data[i]!.createdAt), 0));
    }

    const getBoxStyle = (status: HistoryPoint["worstStatus"] | undefined) => {
        if (!status) return "bg-zinc-200";

        if (status === 'Up') return "bg-emerald-500 hover:bg-emerald-400";
        if (status === 'Down') return "bg-rose-500 hover:bg-rose-400";

        return "bg-amber-400 hover:bg-amber-300";
    };

    const getTooltipLabel = (point: HistoryPoint | undefined) => {
        if (!point) return "No Data Recorded";
        if (point.worstStatus === 'Up') return `Operational (${Math.round(point.avg_latency)}ms)`;
        if (point.worstStatus === 'Down') return "Downtime Detected";
        return "Status Unknown";
    };

    return (
        <div className="w-full space-y-2">

            <div className="flex gap-[3px] h-10 items-end justify-center">
                <TooltipProvider>
                    {!data.length && <div className="text-slate-200">Monitoring in progress. Status will appear shortly.</div>}
                    {slots.map((slot, index) => {
                        return (
                            <Tooltip key={index} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <div className={`flex-1 h-8 max-w-4 rounded-[2px] cursor-pointer transition-all duration-200 hover:h-10 hover:shadow-md ${getBoxStyle(data[index]?.worstStatus)}`} />
                                </TooltipTrigger>
                                <TooltipContent className="bg-popover text-popover-foreground border shadow-lg">
                                    <div className="text-sm font-semibold mb-1">
                                        {format(slot, "MMM d, HH:mm")}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`w-2 h-2 rounded-full ${data[index]?.worstStatus === 'Up' ? 'bg-emerald-500' : data[index]?.worstStatus === 'Down' ? 'bg-red-500' : 'bg-yellow-400'}`}></span>
                                        {getTooltipLabel(data[index])}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>
        </div>
    );
}