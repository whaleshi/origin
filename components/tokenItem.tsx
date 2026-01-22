import React, { useState, useRef, useEffect } from "react";
import MyAvatar from "@/components/avatar";
import { ItemIcon } from "./icons";
import Marquee from "react-fast-marquee";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { formatPercent, getPercentClass } from "@/utils/number";
import { Skeleton } from "@heroui/react";

type TokenItemData = any;

interface TokenItemProps {
	bg?: string;
	data?: TokenItemData;
	onClick?: (item?: TokenItemData) => void;
}

const formatPrice = (value: number | string | null | undefined, fallback: string) => {
	if (value === null || value === undefined) return fallback;
	const text = formatBigNumber(value);
	return text.includes("$") ? text : `$${text}`;
};

export default function TokenItem({ bg, data, onClick }: TokenItemProps) {
	const [shouldScroll, setShouldScroll] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	// 用于测量的隐藏 ref
	const measureRef = useRef<HTMLSpanElement>(null);

	const displayName = data?.name || "--";
	const displaySymbol = data?.symbol || "--";
	const displayPrice = formatPrice(data?.price_usd_f, "$0.00");
	const changeValue = data?.price_change_24h_f;
	const displayChange = formatPercent(changeValue, "0.00%");
	const changeClass = getPercentClass(changeValue);
	const avatarSrc = data?.image_url || "/images/default.png";
	const progress = (data?.launch_progress ?? 0);
	const displayMc = data?.market_cap_f || "--";

	useEffect(() => {
		const checkOverflow = () => {
			if (containerRef.current && measureRef.current) {
				const containerWidth = containerRef.current.offsetWidth;
				const textWidth = measureRef.current.offsetWidth;

				// 只有当文字宽度大于容器时才滚动
				setShouldScroll(textWidth > containerWidth);
			}
		};

		// 延迟 1 秒判断，确保三列布局已经渲染稳定
		const timer = setTimeout(checkOverflow, 1000);

		window.addEventListener('resize', checkOverflow);
		return () => {
			clearTimeout(timer);
			window.removeEventListener('resize', checkOverflow);
		};
	}, [displayName]);

	return (
		<div
			className="w-full h-[64px] rounded-[8px] p-[12px] flex items-center cursor-pointer gap-[8px] overflow-hidden"
			style={{ backgroundColor: bg || "#191B1F" }}
			onClick={() => onClick?.(data)}
		>
			{/* 左侧头像 */}
			<div className="flex-shrink-0 w-[46px] h-[46px] border-[1.5px] border-transparent rounded-full flex items-center justify-center relative">
				<div className={`w-full h-full border-[1.5px] ${data?.is_refine === 1 ? 'border-[#FD7438]' : 'border-transparent'} rounded-full flex items-center justify-center`}>
					<MyAvatar src={avatarSrc} alt="icon" className="w-[40px] h-[40px] bg-[transparent]" />
				</div>
				{data?.is_refine === 1 && <ItemIcon className="absolute -bottom-[1px] -right-[1px]" />}
			</div>

			{/* 中间信息区 */}
			<div className='flex flex-col justify-between flex-1 min-w-0 overflow-hidden relative h-[40px]'>
				<span
					ref={measureRef}
					className="absolute invisible whitespace-nowrap text-[14px]"
					style={{ pointerEvents: 'none' }}
				>
					{displayName}
				</span>

				<div ref={containerRef} className='text-[14px] text-[#fff] w-full overflow-hidden'>
					<Marquee
						play={shouldScroll}
						gradient={false}
						speed={30}
						className={shouldScroll ? "" : "flex-start"}
					>
						<span className={shouldScroll ? "pr-8" : ""}>
							{displayName}
						</span>
					</Marquee>
				</div>

				{data?.is_on_x === 0 ?
					<div className='text-[12px] text-[#868789] truncate'>{displaySymbol.toUpperCase()}</div>
					: <div className='text-[12px] text-[#4A4B4E] truncate'>MC <span className="text-[#868789]">${formatBigNumber(displayMc)}</span></div>
				}
			</div>

			{/* 右侧数据展示区 */}
			<div className='ml-auto flex-shrink-0'>
				{data?.is_on_x === 0 ? (
					<div
						className="w-[70px] h-[32px] rounded-[8px] flex items-center justify-center"
						style={{
							background: `conic-gradient(#FD7438 0deg ${(progress / 100) * 360}deg, #303135 ${(progress / 100) * 360}deg 360deg)`,
							padding: '2px'
						}}
					>
						<div className="w-full h-full bg-[#191B1F] rounded-[6px] flex items-center justify-center">
							<span className="text-[14px] text-[#fff]">{progress.toFixed(2)}%</span>
						</div>
					</div>
				) : (
					<div className='flex flex-col justify-between items-end'>
						<div className="text-[14px] text-[#fff]">{displayPrice}</div>
						<div className="text-[12px] text-[#4A4B4E]">
							24H<span className={`ml-[2px] ${changeClass}`}>{displayChange}</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export function TokenItemSkeleton() {
	return (
		<div className="w-full h-[64px] rounded-[8px] p-[12px] flex items-center gap-[8px] bg-[#191B1F]">
			<Skeleton className="w-[46px] h-[46px] rounded-full" />
			<div className="flex flex-col justify-between flex-1 min-w-0 h-[40px]">
				<Skeleton className="h-[14px] w-[60%] rounded-[4px]" />
				<Skeleton className="h-[12px] w-[40%] rounded-[4px]" />
			</div>
			<div className="flex flex-col items-end justify-between h-[40px]">
				<Skeleton className="h-[14px] w-[56px] rounded-[4px]" />
				<Skeleton className="h-[12px] w-[48px] rounded-[4px]" />
			</div>
		</div>
	);
}
