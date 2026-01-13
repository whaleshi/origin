"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

export default function SwapAbout() {
	const chartRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chartRef.current) return;
		const chart = echarts.init(chartRef.current);

		// 使用 [x, y] 数据对，x 为递增索引
		// 初始化模式："zero" -> 一段全为 0 的水平线；"wobble" -> 一段轻微波动的随机数据
		type InitMode = "zero" | "wobble";
		const INIT_MODE = "zero" as const; // 改成 "wobble" 可获得轻微波动的初始段
		const INIT_COUNT = 20; // 初始点数
		const data: Array<[number, number]> = [];
		const rand = (min: number, max: number) => Math.random() * (max - min) + min;
		const seedData = (mode: InitMode) => {
			let y = 0;
			for (let i = 0; i < INIT_COUNT; i++) {
				if (mode === "wobble") {
					const delta = rand(-0.3, 0.8);
					y = Math.max(0, +(y + delta).toFixed(2));
				} else {
					y = 0;
				}
				data.push([i, y]);
			}
		};
		seedData(INIT_MODE);
		const getLast = () => {
			const last = data[data.length - 1];
			return { idx: last[0], val: last[1] };
		};
		const getTrendColor = () => {
			if (data.length < 2) return { line: "#FF4848", areaTop: "rgba(255, 72, 72, 0.10)", point: "#FF4848" };
			const prev = data[data.length - 2][1];
			const curr = data[data.length - 1][1];
			if (curr >= prev) {
				return { line: "#17C964", areaTop: "rgba(23, 201, 100, 0.10)", point: "#17C964" };
			}
			return { line: "#FF4848", areaTop: "rgba(255, 72, 72, 0.10)", point: "#FF4848" };
		};
		const getMaxX = () => Math.max(1, getLast().idx);

		// 初始配置：折线 + 呼吸点
		const UPDATE_MS = 500;
		const INIT_MS = 800; // 初次绘制线的动画时长
		const trend = getTrendColor();
		chart.setOption({
			grid: { left: 16, right: 16, top: 12, bottom: 12 },
			xAxis: { show: false, type: "value", min: 0, max: getMaxX() },
			// y 轴加一点上下留白，避免线贴边看不清
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
					data,
					smooth: true,
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: trend.areaTop },
							{ offset: 1, color: "rgba(255, 72, 72, 0.00)" },
						]),
					},
					lineStyle: { color: trend.line, width: 4 },
					showSymbol: false,
					// 初始绘制动画
					animationDuration: INIT_MS,
					animationEasing: "quartOut",
					// 更新动画
					animationDurationUpdate: UPDATE_MS,
					animationEasingUpdate: "quartOut",
				},
				{
					id: "last-ripple",
					type: "effectScatter",
					coordinateSystem: "cartesian2d",
					// 初始化先不显示点，等线画完再出现
					data: [],
					symbol: "circle",
					symbolSize: 8,
					itemStyle: { color: trend.point },
					rippleEffect: { brushType: "stroke", scale: 4, period: 2 },
					showEffectOn: "render",
					zlevel: 1,
					z: 10,
					// 让点的更新与线一致
					animationDurationUpdate: UPDATE_MS,
					animationEasingUpdate: "quartOut",
				},
			],
		});

		// 每 1-2s 追加一个数据点（简单的非负随机游走）
		let timer: number | null = null;
		let initTimer: number | null = null;
		// 更自然的走势：带轻微漂移的随机游走 + 缓慢均值回归 + 偶发小冲击
		let drift = rand(-0.05, 0.15);
		let driftStepsLeft = Math.floor(rand(8, 16));
		const baseLevel = () => Math.max(0.8, data[0][1] + 0.5);
		let shockCountdown = Math.floor(rand(12, 28));
		const getMinX = () => data[0][0];
		const schedule = () => {
			timer = window.setTimeout(() => {
				const { idx, val } = getLast();
				// 漂移方向每隔一段时间随机调整
				driftStepsLeft -= 1;
				if (driftStepsLeft <= 0) {
					drift = rand(-0.1, 0.18);
					driftStepsLeft = Math.floor(rand(8, 16));
				}
				// 均值回归：拉回到一个缓慢上移的“基线”
				const meanRevert = (baseLevel() - val) * 0.02;
				// 轻噪声
				let delta = drift + meanRevert + rand(-0.25, 0.35);
				// 偶发小冲击（不再暴跌）
				shockCountdown -= 1;
				if (shockCountdown <= 0) {
					delta += rand(-0.8, 0.8);
					shockCountdown = Math.floor(rand(12, 28));
				}
				let nextVal = +(val + delta).toFixed(2);
				nextVal = Math.max(0, nextVal);
				const nextX = idx + 1;
				data.push([nextX, nextVal]);
				// 可选：限制最大长度，避免内存增长
				if (data.length > 300) {
					data.shift();
				}
				const { idx: lx, val: ly } = getLast();
				const nextTrend = getTrendColor();
				// 同步更新折线与呼吸点，二者同动画时长，点始终贴线
				chart.setOption({
					xAxis: { min: getMinX(), max: getMaxX() },
					series: [
						{
							id: "main-line",
							data,
							animationDurationUpdate: UPDATE_MS,
							animationEasingUpdate: "quartOut",
							lineStyle: { color: nextTrend.line },
							areaStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
									{ offset: 0, color: nextTrend.areaTop },
									{ offset: 1, color: "rgba(255, 72, 72, 0.00)" },
								]),
							},
						},
						{
							id: "last-ripple",
							data: [[lx, ly]],
							animationDurationUpdate: UPDATE_MS,
							animationEasingUpdate: "quartOut",
							itemStyle: { color: nextTrend.point },
						},
					],
				});
				schedule();
			}, Math.floor(rand(1000, 2000)));
		};
		// 等初次线绘制完成后再出现“点”，并启动后续追加
		initTimer = window.setTimeout(() => {
			const { idx: lx, val: ly } = getLast();
			chart.setOption({ series: [{ id: "last-ripple", data: [[lx, ly]] }] });
			schedule();
		}, INIT_MS);

		const onResize = () => chart.resize();
		window.addEventListener("resize", onResize);
		return () => {
			if (timer) window.clearTimeout(timer);
			if (initTimer) window.clearTimeout(initTimer);
			window.removeEventListener("resize", onResize);
			chart.dispose();
		};
	}, []);

	return <div ref={chartRef} className="px-0 md:px-[10px]" style={{ width: "100%", height: 300 }} />;
}
