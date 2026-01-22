"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";
import { useQuery } from "@tanstack/react-query";
import { getKlines } from "@/service/api";

type SwapAboutProps = {
	coinInfo?: any;
	interval?: "1min" | "3min" | "5min" | "15min" | "30min" | "45min" | "1hour" | "2hour" | "3hour" | "4hour" | "1day" | "1month" | "1week";
};

const intervalSecondsMap: Record<NonNullable<SwapAboutProps["interval"]>, number> = {
	"1min": 60,
	"3min": 180,
	"5min": 300,
	"15min": 900,
	"30min": 1800,
	"45min": 2700,
	"1hour": 3600,
	"2hour": 7200,
	"3hour": 10800,
	"4hour": 14400,
	"1day": 86400,
	"1week": 604800,
	"1month": 2592000,
};

const DEFAULT_POINTS = 120;

export default function SwapAbout({ coinInfo, interval = "1min" }: SwapAboutProps) {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstanceRef = useRef<echarts.ECharts | null>(null);
	const mint = coinInfo?.mint;

	const { data: klineData, isLoading } = useQuery({
		queryKey: ["klines", mint, interval],
		queryFn: async () => {
			const endTime = Math.floor(Date.now() / 1000);
			const span = intervalSecondsMap[interval] ?? 60;
			const startTime = endTime - span * DEFAULT_POINTS;
			const result = await getKlines({
				mint,
				interval,
				start_time: 1768899120,
				end_time: 1768999120,
			});
			return result?.data;
		},
		enabled: !!mint,
		refetchInterval: 10000,
	});

	const fallbackLine = useMemo(() => {
		const span = intervalSecondsMap[interval] ?? 60;
		const endTime = Date.now();
		const startTime = endTime - span * 1000;
		return [
			[startTime, 0],
			[endTime, 0],
		] as Array<[number, number]>;
	}, [interval]);

	const lineData = useMemo(() => {
		const raw = (klineData as any)?.data ?? [];
		if (!Array.isArray(raw)) return fallbackLine;
		const parsed = raw
			.map((item: any) => {
				const ts = item?.timestamp ?? item?.ts ?? item?.time ?? item?.open_time ?? item?.[0];
				const close = item?.close ?? item?.c ?? item?.[4];
				const timeMs = Number(ts) > 1e12 ? Number(ts) : Number(ts) * 1000;
				const price = Number(close);
				if (!Number.isFinite(timeMs) || !Number.isFinite(price)) return null;
				return [timeMs, price] as [number, number];
			})
			.filter(Boolean) as Array<[number, number]>;
		return parsed.length ? parsed : fallbackLine;
	}, [klineData, fallbackLine]);

	const trend = useMemo(() => {
		if (lineData.length < 2) return { line: "#FF4848", areaTop: "rgba(255, 72, 72, 0.10)", point: "#FF4848" };
		const prev = lineData[lineData.length - 2][1];
		const curr = lineData[lineData.length - 1][1];
		if (curr >= prev) {
			return { line: "#17C964", areaTop: "rgba(23, 201, 100, 0.10)", point: "#17C964" };
		}
		return { line: "#FF4848", areaTop: "rgba(255, 72, 72, 0.10)", point: "#FF4848" };
	}, [lineData]);

	useEffect(() => {
		if (!chartRef.current) return;
		if (!chartInstanceRef.current) {
			chartInstanceRef.current = echarts.init(chartRef.current);
		}
		const chart = chartInstanceRef.current;
		chart.setOption({
			grid: { left: 16, right: 16, top: 12, bottom: 12 },
			xAxis: { show: false, type: "time" },
			yAxis: {
				show: false,
				type: "value",
				min: (v: any) => v.min - Math.max(0.5, (v.max - v.min) * 0.1),
				max: (v: any) => v.max + Math.max(0.5, (v.max - v.min) * 0.1),
			},
			animation: true,
			series: [
				{
					id: "main-line",
					type: "line",
					data: lineData,
					smooth: true,
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: trend.areaTop },
							{ offset: 1, color: "rgba(255, 72, 72, 0.00)" },
						]),
					},
					lineStyle: { color: trend.line, width: 4 },
					showSymbol: false,
					animationDuration: 800,
					animationEasing: "quartOut",
					animationDurationUpdate: 500,
					animationEasingUpdate: "quartOut",
				},
				{
					id: "last-ripple",
					type: "effectScatter",
					coordinateSystem: "cartesian2d",
					data: lineData.length ? [lineData[lineData.length - 1]] : [],
					symbol: "circle",
					symbolSize: 8,
					itemStyle: { color: trend.point },
					rippleEffect: { brushType: "stroke", scale: 4, period: 2 },
					showEffectOn: "render",
					zlevel: 1,
					z: 10,
					animationDurationUpdate: 500,
					animationEasingUpdate: "quartOut",
				},
			],
		});

		const onResize = () => chart.resize();
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, [lineData, trend]);

	useEffect(() => {
		return () => {
			if (chartInstanceRef.current) {
				chartInstanceRef.current.dispose();
				chartInstanceRef.current = null;
			}
		};
	}, []);

	return (
		<div className="relative">
			<div ref={chartRef} className="px-0 md:px-[10px]" style={{ width: "100%", height: 300 }} />
		</div>
	);
}
