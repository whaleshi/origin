import MyAvatar from "@/components/avatar";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { formatPercent, getPercentClass } from "@/utils/number";
import { ItemIcon } from "./icons";
import ScrollingName from "./scrollingName";
import BigNumber from "bignumber.js";
import { Skeleton } from "@heroui/react";

type MeTokenItemType = "holder" | "mining" | "created";

type MeTokenItemProps = {
	type: MeTokenItemType;
	data?: any;
	tokenBalanceText?: string;
	tokenBalanceValue?: bigint;
	onClick?: (item?: any) => void;
};

const getTokenInfo = (data?: any) => data?.coin_info ?? data ?? {};

const formatPrice = (value: number | string | null | undefined, fallback: string) => {
	if (value === null || value === undefined) return fallback;
	const text = formatBigNumber(value);
	return text.includes("$") ? text : `$${text}`;
};

export default function MeTokenItem({ type, data, tokenBalanceText, tokenBalanceValue, onClick }: MeTokenItemProps) {
	const tokenInfo = getTokenInfo(data);
	const displayName = tokenInfo?.name ?? "--";
	const displaySymbol = tokenInfo?.symbol ?? "--";
	const avatarSrc = tokenInfo?.image_url || "/images/default.png";
	const balanceSuffix = tokenBalanceText && tokenBalanceText !== "--" && (type === "holder" || type === "created")
		? `${tokenBalanceText}`
		: "";
	const priceValue = tokenInfo?.price_usd_f ?? data?.price_usd_f;
	const changeValue = tokenInfo?.price_change_24h_f ?? tokenInfo?.coin_info?.price_change_24h_f ?? data?.price_change_24h_f;
	const isOnX = tokenInfo?.is_on_x ?? tokenInfo?.is_on_x;
	const progress = (tokenInfo?.launch_progress ?? tokenInfo?.coin_info?.launch_progress ?? 0);
	const displayPrice = formatPrice(priceValue, "$0.00");
	const displayChange = formatPercent(changeValue, "0.00%");
	const changeClass = getPercentClass(changeValue);
	const isMining = type === "mining";
	const miningRoundId = tokenInfo?.show_round_id;
	const miningRoundText = miningRoundId !== null && miningRoundId !== undefined ? `#${miningRoundId}` : "#--";
	const miningShareText = formatPercent(tokenInfo?.my_ratio ?? tokenInfo?.round_ratio ?? tokenInfo?.ratio, "0.00%");
	const balanceUsdText = (() => {
		if (!tokenBalanceValue || tokenBalanceValue <= 0n || priceValue === null || priceValue === undefined) {
			return "--";
		}
		const priceBn = new BigNumber(priceValue.toString());
		if (!priceBn.isFinite() || priceBn.lte(0)) return "--";
		const balanceBn = new BigNumber(tokenBalanceValue.toString()).dividedBy(new BigNumber(10).pow(18));
		const usdValue = balanceBn.multipliedBy(priceBn);
		const formatted = formatBigNumber(usdValue, {
			decimals: 0,
			compact: false,
			withComma: true,
			precision: 2,
			trimTrailingZero: true,
		});
		return formatted.includes("$") ? formatted : `$${formatted}`;
	})();
	return (
		<div
			className="w-full h-[64px] rounded-[8px] p-[12px] flex items-center cursor-pointer gap-[8px] overflow-hidden"
			style={{ backgroundColor: "#191B1F" }}
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
				<ScrollingName text={displayName} className="text-[14px] text-[#fff] pr-[10px]" />
				{isMining ? (
					<div className='text-[12px] text-[#868789] truncate'>{miningRoundText}</div>
				) : isOnX === 0 ?
					<div className='text-[12px] text-[#868789] truncate'>{displaySymbol.toUpperCase()}</div>
					: <div className='text-[12px] text-[#868789]'>{balanceSuffix}</div>
				}
			</div>

			{/* 右侧数据展示区 */}
			<div className='ml-auto flex-shrink-0'>
				{isMining ? (
					<div className='flex flex-col justify-between items-end'>
						<div className="text-[14px] text-[#fff]">{miningShareText}</div>
						<div className="text-[12px] text-[#4A4B4E]">本轮占比</div>
					</div>
				) : isOnX === 0 ? (
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
						<div className="text-[14px] text-[#fff]">{balanceUsdText}</div>
						<div className={`text-[12px] ${changeClass}`}>
							{displayPrice}<span className={`ml-[2px]`}>({displayChange})</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export function MeTokenItemSkeleton() {
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
