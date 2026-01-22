import MyAvatar from "@/components/avatar";
import { useState } from "react";
import { Input, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { BianWalletIcon, BNBIcon, CloseIcon, CopyIcon, OKXWalletIcon, TgIcon, WebIcon, XIcon } from "./icons";
import MarketTrade from "./marketTrade";
import ScrollingName from "./scrollingName";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { formatPercent, getPercentClass } from "@/utils/number";
import { DEFAULT_CHAIN_CONFIG } from "@/config/chains";
import { shortenAddress } from "@/utils";
import useClipboard from "@/hooks/useCopyToClipboard";

type MarketProps = {
	coinInfo?: any;
	onSwitchToMining?: () => void;
};

const getAddressUrl = (address: string | null | undefined) => {
	const base = DEFAULT_CHAIN_CONFIG?.explorerUrl;
	if (!base || !address) return "";
	return `${base}/address/${address}`;
};
const getBinanceWalletUrl = (address: string | null | undefined) => {
	if (!address) return "";
	return `https://web3.binance.com/token/bsc/${address}`;
};
const getOkxWalletUrl = (address: string | null | undefined) => {
	if (!address) return "";
	return `https://web3.okx.com/token/bsc/${address}`;
};

export default function Market({ coinInfo, onSwitchToMining }: MarketProps) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [side, setSide] = useState<"buy" | "sell">("buy");
	const { copy } = useClipboard();
	const changeValue = coinInfo?.price_change_24h_f;
	const displayChange = formatPercent(changeValue, "0.00%");
	const changeClass = getPercentClass(changeValue);

	return (
		<div className="max-w-[600px] w-full">
			<div className="mt-[24px] flex items-center">
				<MyAvatar src={coinInfo?.image_url || "/images/default.png"} alt="icon" className="w-[48px] h-[48px] bg-[transparent]" />
				<div className='h-[48px] flex flex-col justify-between ml-[8px] min-w-0 flex-1'>
					<ScrollingName text={coinInfo?.name ?? "--"} className="text-[17px] text-[#fff] font-semibold pr-[20px]" />
					<div className='text-[13px] text-[#8D8B90] truncate'>{coinInfo?.symbol ?? "--"}</div>
				</div>
				<div className='h-[48px] flex flex-col justify-between items-end ml-auto'>
					<div className="text-[17px] text-[#fff] font-semibold">${formatBigNumber(coinInfo?.price_usd_f)}</div>
					<div className="text-[13px] text-[#4A4B4E]">
						24H<span className={`ml-[2px] ${changeClass}`}>{displayChange}</span>
					</div>
				</div>
			</div>
			<div className="border-[1px] border-dashed border-[#25262A] rounded-[10px] my-[24px]">
				<div className={`${coinInfo?.is_refine != 1 ? 'h-[40px]' : 'h-[60px]'} flex w-full`}>
					<div className={`text-[14px] text-[#868789] px-[12px] flex-1 flex ${coinInfo?.is_refine === 1 ? 'flex-col justify-center' : 'justify-between'} items-center `}>市值<span className="text-[#fff]">${formatBigNumber(coinInfo?.market_cap_f)}</span></div>
				</div>
				{
					coinInfo?.is_refine != 1 && <div className="p-[12px] border-t-[1px] border-dashed border-[#25262A] overflow-hidden relative">
						<div className="absolute inset-0 w-full h-full rounded-br-[10px] overflow-hidden">
							<div
								className="h-full border-r-[1px] border-[#17C964]"
								style={{
									width: `${Math.max(0, Math.min(100, Number(coinInfo?.launch_progress ?? 0)))}%`,
									background: "linear-gradient(90deg, rgba(23, 201, 100, 0.00) 0%, rgba(23, 201, 100, 0.30) 100%)",
								}}
							></div>
						</div>
						<div className="text-[12px] text-[#868789]">Bonding Curve 进度</div>
						<div className="text-[#fff] text-[16px] font-semibold">{coinInfo?.launch_progress?.toFixed(2) ?? 0}%</div>
					</div>
				}
			</div>
			{
				coinInfo?.is_refine != 1 ? <div className="hidden md:block"><MarketTrade coinInfo={coinInfo} side={side} onSideChange={setSide} /></div> :
					<div className="hidden md:block">
						<Button
							fullWidth
							className="h-[44px] bg-[#FD7438] text-[15px] text-[#fff] rounded-[8px]"
							onPress={onSwitchToMining}
						>
							去挖矿
						</Button>
						<div className="flex gap-[12px] mt-[12px]">
							<Button
								fullWidth
								className="h-[44px] bg-[#25262A] text-[15px] text-[#fff] rounded-[8px]"
								onPress={() => {
									const url = getBinanceWalletUrl(coinInfo?.mint);
									if (url) window.open(url, "_blank");
								}}
							>
								<BianWalletIcon />
								BNB Wallet
							</Button>
							<Button
								fullWidth
								className="h-[44px] bg-[#25262A] text-[15px] text-[#fff] rounded-[8px]"
								onPress={() => {
									const url = getOkxWalletUrl(coinInfo?.mint);
									if (url) window.open(url, "_blank");
								}}
							>
								<OKXWalletIcon />
								OKX
							</Button>
						</div>
					</div>
			}
			<div className="text-[15px] font-semibold mt-[24px]">代币详情</div>
			<div className="text-[13px] text-[#868789] mt-[12px]">{coinInfo?.site_info_obj?.description}</div>
			{(coinInfo?.site_info_obj?.x || coinInfo?.site_info_obj?.telegram || coinInfo?.site_info_obj?.website) && (
				<div className="flex items-center gap-[8px] mt-[12px]">
					{coinInfo?.site_info_obj?.x && (
						<a href={coinInfo.site_info_obj.x} target="_blank" rel="noopener noreferrer">
							<XIcon className="cursor-pointer" />
						</a>
					)}
					{coinInfo?.site_info_obj?.telegram && (
						<a href={coinInfo.site_info_obj.telegram} target="_blank" rel="noopener noreferrer">
							<TgIcon className="cursor-pointer" />
						</a>
					)}
					{coinInfo?.site_info_obj?.website && (
						<a href={coinInfo.site_info_obj.website} target="_blank" rel="noopener noreferrer">
							<WebIcon className="cursor-pointer" />
						</a>
					)}
				</div>
			)}
			<div className="bg-[#191B1F] p-[12px] border-[1px] border-[#25262A] rounded-[8px] mt-[24px] text-[13px] text-[#868789] flex flex-col gap-[8px] mb-[30px]">
				<div className="flex items-center justify-between">代币总量<span className="text-[#fff]">{formatBigNumber(coinInfo?.token_supply, { decimals: 8, compact: false, withComma: true, precision: 8, trimTrailingZero: true })}</span></div>
				<div className="flex items-center justify-between">联合曲线总量<span className="text-[#fff]">{formatBigNumber(coinInfo?.bonding_curve_total, { decimals: 8, compact: false, withComma: true, precision: 8, trimTrailingZero: true })}</span></div>
				<div className="flex items-center justify-between">Pancake 流动性<span className="text-[#fff]">{formatBigNumber(coinInfo?.pancake_liquidity, { decimals: 8, compact: false, withComma: true, precision: 8, trimTrailingZero: true })}</span></div>
				<div className="border-y-[1px] border-[#303135] border-dashed flex flex-col gap-[8px] py-[8px]">
					<div className="flex items-center justify-between">代币挖矿预留<span className="text-[#fff]">{formatBigNumber(coinInfo?.mining_reserve, { decimals: 8, compact: false, withComma: true, precision: 8, trimTrailingZero: true })}</span></div>
					<div className="flex items-center justify-between">
						挖矿状态
						<span className={coinInfo?.is_refine === 1 ? "text-[#17C964]" : "text-[#FD7438]"}>
							{coinInfo?.is_refine === 1 ? "已激活" : "待激活"}
						</span>
					</div>
				</div>
				<div className="flex items-center justify-between">
					合约地址
					<a
						href={getAddressUrl(coinInfo?.mint)}
						target="_blank"
						rel="noreferrer"
						className="text-[#fff] underline flex items-center gap-[4px]"
					>
						{shortenAddress(coinInfo?.mint)}
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (coinInfo?.mint) copy(coinInfo.mint);
							}}
						>
							<CopyIcon className="cursor-pointer" />
						</button>
					</a>
				</div>
				<div className="flex items-center justify-between">
					创建者
					<a
						href={getAddressUrl(coinInfo?.creator)}
						target="_blank"
						rel="noreferrer"
						className="text-[#fff] underline flex items-center gap-[4px]"
					>
						{shortenAddress(coinInfo?.creator)}
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (coinInfo?.creator) copy(coinInfo.creator);
							}}
						>
							<CopyIcon className="cursor-pointer" />
						</button>
					</a>
				</div>
			</div>
			{
				coinInfo?.is_refine != 1 ? <div className="h-[60px] bg-[#0D0F13] border-t-[1px] border-[#25262A] w-full fixed bottom-0 left-0 right-0 px-[16px] flex items-center gap-[8px] md:hidden">
					<Button
						fullWidth
						className="h-[44px] bg-[#FF5160] rounded-[8px] text-[15px]"
						onPress={() => {
							setSide("sell");
							onOpen();
						}}
					>
						卖出
					</Button>
					<Button
						fullWidth
						className="h-[44px] bg-[#17C964] rounded-[8px] text-[15px]"
						onPress={() => {
							setSide("buy");
							onOpen();
						}}
					>
						买入
					</Button>
				</div> : <div className="h-[60px] bg-[#0D0F13] border-t-[1px] border-[#25262A] w-full fixed bottom-0 left-0 right-0 px-[16px] flex items-center gap-[8px] md:hidden">
					<Button
						className="h-[44px] w-[44px] min-w-[44px] p-0 bg-[#25262A] text-[15px] text-[#fff] rounded-[8px]"
						onPress={() => {
							const url = getBinanceWalletUrl(coinInfo?.mint);
							if (url) window.open(url, "_blank");
						}}
					>
						<BianWalletIcon />
					</Button>
					<Button
						className="h-[44px] w-[44px] min-w-[44px] p-0 bg-[#25262A] text-[15px] text-[#fff] rounded-[8px]"
						onPress={() => {
							const url = getOkxWalletUrl(coinInfo?.mint);
							if (url) window.open(url, "_blank");
						}}
					>
						<OKXWalletIcon />
					</Button>
					<Button
						fullWidth
						className="h-[44px] bg-[#FD7438] rounded-[8px] text-[15px]"
						onPress={onSwitchToMining}
					>
						去挖矿
					</Button>
				</div>
			}

			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="md"
				hideCloseButton
				placement="bottom-center"
				classNames={{
					backdrop: "bg-black/80",
					base: "bg-[#191B1F] border-none rounded-[0px] rounded-t-[12px] mx-0 md:mx-4 mb-0 md:my-auto",
					wrapper: "items-end md:items-center",
					header: "border-none pb-0",
					body: "p-0"
				}}
			>
				<ModalContent className="relative overflow-visible">
					<div
						className="absolute left-1/2 -translate-x-1/2 -translate-y-[calc(100%-10px)] top-0 z-10"
						style={{ width: `${(343 / 375) * 100}%`, aspectRatio: '343/124' }}
					>
					</div>
					<ModalHeader className="flex justify-center items-center p-0 relative h-[48px] mt-[8px]">
						<div className="flex h-[36px] bg-[#25262A] rounded-[8px] w-[180px]">
							<button
								type="button"
								onClick={() => setSide("buy")}
								className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${side === "buy"
									? "bg-[rgba(23,201,100,0.15)] border-[#17C964] text-[#E9FFEF]"
									: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
									}`}
							>
								买入
							</button>
							<button
								type="button"
								onClick={() => setSide("sell")}
								className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${side === "sell"
									? "bg-[rgba(255,81,96,0.15)] border-[#FF5160] text-[#FFE9EB]"
									: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
									}`}
							>
								卖出
							</button>
						</div>
						<button className="absolute right-[16px] top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity cursor-pointer" onClick={onOpenChange}>
							<CloseIcon />
						</button>
					</ModalHeader>
					<ModalBody className="px-[14px] pb-[20px]">
						<MarketTrade coinInfo={coinInfo} side={side} onSideChange={setSide} />
					</ModalBody>
				</ModalContent>
			</Modal>
		</div>
	);
}
