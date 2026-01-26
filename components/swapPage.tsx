import { CopyIcon, SelectDownIcon, SettingIcon, SwapIcon, ZuanIcon, ZuanRightIcon } from "@/components/icons";
import { Input, Button } from "@heroui/react";
import { useEffect, useState } from "react";
import MyAvatar from "@/components/avatar";
import SwapAbout from "@/components/swapAbout";
import MiningDialog from "@/components/miningDialog";
import { SwapList } from "@/components/swapList";
import ListDialog from "@/components/listDialog";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getCoinShow } from "@/service/api";
import { DEFAULT_CHAIN_CONFIG } from "@/config/chains";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useSlippageStore } from "@/stores/slippage";
import { SlippageModal } from "./slippageModal";
import { useSwapTrade } from "@/hooks/useSwapTrade";
import { useAuthStore } from "@/stores/auth";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/utils/toastHelpers";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { formatPercent, getPercentClass, format8 } from "@/utils/number";
import { shortenAddress } from "@/utils";
import { customToast } from "@/components/customToast";
import useClipboard from "@/hooks/useCopyToClipboard";
import usePrivyLogin from "@/hooks/usePrivyLogin";
import { useTranslation } from "react-i18next";

const getAddressUrl = (address: string | null | undefined) => {
	const base = DEFAULT_CHAIN_CONFIG?.explorerUrl;
	if (!base || !address) return "";
	return `${base}/address/${address}`;
};

export default function SwapPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const addrParam = router.query.addr;
	const mint = Array.isArray(addrParam) ? addrParam[0] : (addrParam as string | undefined);
	const [topAmount, setTopAmount] = useState("");
	const [bottomAmount, setBottomAmount] = useState("");
	const [isReversed, setIsReversed] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isMiningDialogOpen, setIsMiningDialogOpen] = useState(false);
	const [isListDialogOpen, setIsListDialogOpen] = useState(false);
	const [selectedCoin, setSelectedCoin] = useState<any | null>(null);
	const { address } = useAuthStore();
	const { copy } = useClipboard();
	const { toLogin } = usePrivyLogin();

	const { data: coinInfo } = useQuery({
		queryKey: ["coinShow", mint],
		queryFn: async () => {
			const res = await getCoinShow({ mint });
			return res?.data ?? null;
		},
		enabled: !!mint,
		refetchInterval: 3000,
	});
	const changeValue = coinInfo?.price_change_24h_f;
	const displayChange = formatPercent(changeValue, "0.00%");
	const changeClass = getPercentClass(changeValue);

	useEffect(() => {
		if (!mint) {
			setSelectedCoin(null);
			return;
		}
		setSelectedCoin(null);
		if (coinInfo) setSelectedCoin(coinInfo);
	}, [mint, coinInfo]);

	const selectedSymbol = selectedCoin?.symbol ?? t("Swap.selectTokenPrompt");
	const selectedAvatar = selectedCoin?.image_url || "/images/default.png";
	const originSymbol = DEFAULT_CHAIN_CONFIG?.originSymbol ?? t("Swap.originSymbol");
	const originAddress = DEFAULT_CHAIN_CONFIG?.origin as `0x${string}` | undefined;
	const swapRouterAddress = DEFAULT_CHAIN_CONFIG?.swapRouter as `0x${string}` | undefined;
	const { tokenBalanceText: originBalanceText, tokenBalanceValue: originBalanceValue } = useTokenBalance(originAddress, 18);
	const { tokenBalanceText: selectedBalanceText, tokenBalanceValue: selectedBalanceValue } = useTokenBalance(selectedCoin?.mint as `0x${string}` | undefined, 18);
	const { slippage } = useSlippageStore();
	const [isSlippageOpen, setIsSlippageOpen] = useState(false);
	const topIsOrigin = !isReversed;
	const bottomIsOrigin = isReversed;
	const topSymbol = topIsOrigin ? originSymbol : selectedSymbol;
	const topBalanceText = topIsOrigin ? originBalanceText : selectedBalanceText;
	const topBalanceDisplay = topBalanceText === "--" || topSymbol === "--"
		? "--"
		: `${topBalanceText} ${topSymbol}`;
	const topBalanceValue = topIsOrigin ? originBalanceValue : selectedBalanceValue;
	const tradeSide = topIsOrigin ? "buy" : "sell";
	const {
		amountWei,
		estimatedAmountRaw,
		minAmountOut,
		handleBuy,
		handleSell,
		isApproving,
		isSwapping,
	} = useSwapTrade({
		coinInfo: selectedCoin,
		side: tradeSide,
		amount: topAmount,
		amountValue: topAmount,
		slippage,
		originAddress,
		swapRouterAddress,
		onSwapSubmitted: ({ hash, side }) => {
			const actionText = side === "buy" ? t("Actions.buy") : t("Actions.sell");
			showLoadingToast(t("Toast.actionSubmitted", { action: actionText }), `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
		},
		onSwapSuccess: ({ hash, side }) => {
			const actionText = side === "buy" ? t("Actions.buy") : t("Actions.sell");
			showSuccessToast(t("Toast.actionSuccess", { action: actionText }), `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
			setTopAmount("");
			setBottomAmount("");
			setIsSubmitting(false);
		},
		onSwapError: ({ side }) => {
			const actionText = side === "buy" ? t("Actions.buy") : t("Actions.sell");
			showErrorToast(t("Toast.actionFailed", { action: actionText }));
			setIsSubmitting(false);
		},
	});
	useEffect(() => {
		setBottomAmount(estimatedAmountRaw || "");
	}, [estimatedAmountRaw]);

	const hasSelectedToken = !!selectedCoin?.mint;
	const hasAmount = !!topAmount && amountWei > 0n;
	const hasBalanceData = !!address && (topIsOrigin ? !!originAddress : hasSelectedToken);
	const isInsufficient = hasBalanceData && amountWei > topBalanceValue;
	const canSwap = !!address && hasSelectedToken && hasAmount && !isInsufficient;
	const buttonLabel = (() => {
		if (!address) return t("Actions.connectWallet");
		if (!hasSelectedToken) return t("Swap.selectTokenPrompt");
		if (!hasAmount) return t("Swap.enterAmountPrompt");
		if (isInsufficient) return t("Swap.insufficientBalance");
		return t("Swap.swap");
	})();
	const buttonClassName = canSwap
		? "h-[48px] bg-[#fff] text-[#000] mt-[16px]"
		: "h-[48px] bg-[#36383B] text-[15px] text-[#868789] mt-[16px]";
	const isButtonDisabled = address
		? !canSwap || minAmountOut <= 0n || isApproving || isSwapping || isSubmitting
		: false;

	const handleAmountChange = (value: string, setter: (next: string) => void) => {
		if (value === '' || /^\d*\.?\d{0,6}$/.test(value)) {
			const formattedValue = value.startsWith('.') ? '0' + value : value;
			setter(formattedValue);
		}
	};
	const handleSwapSides = () => {
		setIsReversed((prev) => !prev);
		setTopAmount(bottomAmount);
		setBottomAmount(topAmount);
	};

	return <div className="flex flex-col items-center w-full px-[14px]">
		<div className="w-full max-w-[600px] flex items-center justify-between mt-[24px]">
			<div className="text-[28px] text-[#fff] font-bold">{t("Swap.title")}</div>
			<div className="px-[12px] h-[32px] rounded-r-[16px] flex items-center justify-center gap-[2px] cursor-pointer"
				style={{ background: "linear-gradient(90deg, rgba(239, 176, 0, 0.00) 0%, rgba(239, 176, 0, 0.25) 100%)" }}
				onClick={() => {
					if (!selectedCoin?.mint) {
						customToast({ title: t("Swap.selectTokenPrompt"), type: "error" });
						return;
					}
					setIsMiningDialogOpen(true);
				}}
			>
				<ZuanIcon />
				<div className="text-[14px] text-[#EFB000]">{t("Swap.miningRewards")}</div>
				<ZuanRightIcon />
			</div>
		</div>
		<div className="w-full max-w-[600px] mt-[24px]">
			<Input
				classNames={{
					inputWrapper: "h-[60px] !border-[#191B1F] bg-[#191B1F] !border-[1.5px] rounded-[8px] hover:!border-[#191B1F] focus-within:!border-[#191B1F]",
					input: "text-[27px] text-[#FFF] font-semibold placeholder:text-[#4A4B4E] uppercase tracking-[-0.07px]",
				}}
				name="amount"
				placeholder="0.00"
				variant="bordered"
				value={topAmount}
				isDisabled={false}
				onChange={(e) => {
					handleAmountChange(e.target.value, setTopAmount);
				}}
				endContent={
					topIsOrigin ? (
						<div className="shrink-0 flex items-center gap-[6px] h-[36px] border-[1px] border-[#303135] px-[8px] rounded-full min-w-0 max-w-[45%]">
							<div className="shrink-0">
								<MyAvatar src="/images/origin.png" alt="icon" className="w-[24px] h-[24px] bg-[transparent]" />
							</div>
							<div className="text-[16px] text-[#fff] truncate">{originSymbol}</div>
						</div>
					) : (
						<div className="shrink-0 flex items-center gap-[6px] h-[36px] border-[1px] border-[#303135] px-[8px] rounded-full cursor-pointer min-w-0 max-w-[45%]" onClick={() => { setIsListDialogOpen(true); }}>
							{selectedCoin && (
								<div className="shrink-0">
									<MyAvatar src={selectedAvatar} alt="icon" className="w-[24px] h-[24px] bg-[transparent] border-[1px] border-[#36383B]" />
								</div>
							)}
							<div className="text-[16px] text-[#fff] truncate">{selectedSymbol}</div>
							<div className="shrink-0">
								<SelectDownIcon />
							</div>
						</div>
					)
				}
			/>
			<div className="h-[52px] flex items-center gap-[20px]">
				<div className="text-[13px] text-[#868789] flex-1 flex items-center gap-[4px] min-w-0 whitespace-nowrap">
					<span>{t("Swap.walletBalance")}:</span>
					<span className="text-[#fff] truncate">{topBalanceDisplay}</span>
				</div>
				<SwapIcon className="w-[36px] h-[36px] rotate-90 cursor-pointer" onClick={handleSwapSides} />
				<div className="flex items-center justify-end gap-[4px] text-[13px] text-[#868789] flex-1">
					{t("Swap.slippage")}<span className="text-[#fff]">{slippage}%</span>
					<SettingIcon className="cursor-pointer" onClick={() => setIsSlippageOpen(true)} />
				</div>
			</div>
			<Input
				classNames={{
					inputWrapper: "h-[60px] !border-[#191B1F] bg-[#191B1F] !border-[1.5px] rounded-[8px] hover:!border-[#191B1F] focus-within:!border-[#191B1F]",
					input: "text-[27px] text-[#FFF] font-semibold placeholder:text-[#4A4B4E] uppercase tracking-[-0.07px]",
				}}
				name="amount"
				placeholder="0.00"
				variant="bordered"
				value={bottomAmount}
				isReadOnly
				onChange={() => { }}
				endContent={
					bottomIsOrigin ? (
						<div className="shrink-0 flex items-center gap-[6px] h-[36px] border-[1px] border-[#303135] px-[8px] rounded-full min-w-0 max-w-[45%]">
							<div className="shrink-0">
								<MyAvatar src="/images/origin.png" alt="icon" className="w-[24px] h-[24px] bg-[transparent]" />
							</div>
							<div className="text-[16px] text-[#fff] truncate">{originSymbol}</div>
						</div>
					) : (
						<div className="shrink-0 flex items-center gap-[6px] h-[36px] border-[1px] border-[#303135] px-[8px] rounded-full cursor-pointer min-w-0 max-w-[45%]" onClick={() => { setIsListDialogOpen(true); }}>
							{selectedCoin && (
								<div className="shrink-0">
									<MyAvatar src={selectedAvatar} alt="icon" className="w-[24px] h-[24px] bg-[transparent] border-[1px] border-[#36383B]" />
								</div>
							)}
							<div className="text-[16px] text-[#fff] truncate">{selectedSymbol}</div>
							<div className="shrink-0">
								<SelectDownIcon />
							</div>
						</div>
					)
				}
			/>
			<Button
				radius="full"
				fullWidth
				className={buttonClassName}
				isLoading={isSubmitting || isApproving || isSwapping}
				isDisabled={isButtonDisabled}
				onPress={() => {
					if (!address) {
						toLogin();
						return;
					}
					if (isInsufficient) {
						customToast({ title: t("Toast.balanceInsufficient"), type: "error" });
						return;
					}
					if (isSubmitting) return;
					setIsSubmitting(true);
					if (tradeSide === "buy") {
						handleBuy();
					} else {
						handleSell();
					}
				}}
			>
				{buttonLabel}
			</Button>
			{hasSelectedToken && (
				<>
					<div className="mt-[32px] border-[1px] border-[#25262A] border-dashed rounded-[8px] overflow-hidden">
						<div className="h-[60px] flex">
							<div className="text-[16px] text-[#fff] border-r-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]">
								${formatBigNumber(coinInfo?.market_cap_f)}<span className="text-[12px] text-[#868789]">{t("Swap.marketCap")}</span>
							</div>
							<div className="text-[16px] text-[#fff] border-r-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]">
								${formatBigNumber(coinInfo?.price_usd_f)}<span className="text-[12px] text-[#868789]">{t("Swap.price")}</span>
							</div>
						</div>
						<div className="h-[60px] flex border-t-[1px] border-[#25262A] border-dashed">
							<div className={`text-[16px] ${changeClass} border-r-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]`}>
								{displayChange}<span className="text-[12px] text-[#868789]">{t("Swap.change24h")}</span>
							</div>
							<div className="text-[16px] text-[#fff] border-r-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]">
								${formatBigNumber(format8(coinInfo?.external_liquidity))}
								<span className="text-[12px] text-[#868789]">{t("Swap.liquidity")}</span>
							</div>
						</div>
						<div className="h-[60px] text-[16px] text-[#fff] border-t-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]">
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
							<span className="text-[12px] text-[#868789]">{t("Swap.contractAddress")}</span>
						</div>
					</div>
					{/* <div><SwapAbout coinInfo={coinInfo} /></div> */}
					<div className="mt-[20px]"><SwapList coinInfo={coinInfo} /></div>
				</>
			)}
			<MiningDialog
				isOpen={isMiningDialogOpen}
				onOpenChange={setIsMiningDialogOpen}
				coinInfo={selectedCoin}
			/>
			<SlippageModal
				isOpen={isSlippageOpen}
				onClose={() => setIsSlippageOpen(false)}
			/>
			<ListDialog
				isOpen={isListDialogOpen}
				onOpenChange={setIsListDialogOpen}
				onSelect={(item) => {
					if (item?.mint) {
						router.replace(`/swap/${item.mint}`, undefined, { shallow: true, scroll: false });
					}
				}}
			/>
		</div>
	</div>;
}
