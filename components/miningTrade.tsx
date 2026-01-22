import MyAvatar from "@/components/avatar";
import { useState } from "react";
import { Input, Button } from "@heroui/react";
import { LogoIcon, SettingIcon } from "./icons";
import { SlippageModal } from "./slippageModal";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { DEFAULT_CHAIN_CONFIG } from "@/config/chains";
import { useAuthStore } from "@/stores/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useSlippageStore } from "@/stores/slippage";
import { useSwapTrade } from "@/hooks/useSwapTrade";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/utils/toastHelpers";
import usePrivyLogin from "@/hooks/usePrivyLogin";

type MiningTradeProps = {
	coinInfo?: any;
};

export default function MiningTrade({ coinInfo }: MiningTradeProps) {
	const [side, setSide] = useState<"buy" | "sell">("buy");
	const [amount, setAmount] = useState("");
	const [amountValue, setAmountValue] = useState("");
	const [isSlippageOpen, setIsSlippageOpen] = useState(false);
	const { slippage, setSlippage } = useSlippageStore();
	const tokenSymbol = coinInfo?.symbol ?? "--";
	const tokenAvatar = coinInfo?.image_url || "/images/default.png";
	const originAddress = DEFAULT_CHAIN_CONFIG?.origin as `0x${string}` | undefined;
	const originSymbol = DEFAULT_CHAIN_CONFIG?.originSymbol ?? "ORI";
	const { tokenBalanceText: originBalanceText, refetchTokenBalance: refetchOriginBalance } = useTokenBalance(originAddress, 18);
	const { tokenBalanceText: tokenBalanceText, refetchTokenBalance: refetchMemeBalance } = useTokenBalance(coinInfo?.mint as `0x${string}` | undefined, 18);
	const swapRouterAddress = DEFAULT_CHAIN_CONFIG?.swapRouter as `0x${string}` | undefined;
	const queryClient = useQueryClient();
	const { address } = useAuthStore();
	const { toLogin } = usePrivyLogin();
	const balanceText =
		side === "buy"
			? originBalanceText
			: tokenBalanceText;
	const balanceSymbol = side === "buy" ? originSymbol : tokenSymbol;
	const handleSwapSuccess = () => {
		refetchOriginBalance();
		refetchMemeBalance();
		if (address) {
			queryClient.invalidateQueries({ queryKey: ["balance", address] });
		}
	};
	const {
		amountWei,
		estimatedAmount,
		minAmountOut,
		handleBuy,
		handleSell,
		isApproving,
		isSwapping,
	} = useSwapTrade({
		coinInfo,
		side,
		amount,
		amountValue,
		slippage,
		originAddress,
		swapRouterAddress,
		onSwapSubmitted: ({ hash, side: tradeSide }) => {
			const actionText = tradeSide === "buy" ? "买入" : "卖出";
			showLoadingToast(`${actionText}已发起`, `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
		},
		onSwapSuccess: ({ hash, side: tradeSide }) => {
			const actionText = tradeSide === "buy" ? "买入" : "卖出";
			showSuccessToast(`${actionText}成功`, `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
			handleSwapSuccess();
			setAmount("");
			setAmountValue("");
		},
		onSwapError: () => {
			const actionText = side === "buy" ? "买入" : "卖出";
			showErrorToast(`${actionText}失败`);
		},
	});
	const isActionDisabled = address
		? !amount || amountWei <= 0n || minAmountOut <= 0n || isApproving || isSwapping
		: false;
	const actionLabel = address ? (side === "buy" ? "挖矿" : "卖出") : "Connect Wallet";

	return <div className="rounded-[8px] p-[12px] bg-[#191B1F] border-[1px] border-[#25262A]">
		<div className="flex h-[36px] bg-[#25262A] rounded-[8px]">
			<button
				type="button"
				onClick={() => {
					setSide("buy");
					setAmount("");
					setAmountValue("");
				}}
				className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${side === "buy"
					? "bg-[rgba(253,116,56,0.15)] border-[#FD7438] text-[#FD7438]"
					: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
					}`}
			>
				挖矿
			</button>
			<button
				type="button"
				onClick={() => {
					setSide("sell");
					setAmount("");
					setAmountValue("");
				}}
				className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${side === "sell"
					? "bg-[rgba(255,81,96,0.15)] border-[#FF5160] text-[#FF5160]"
					: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
					}`}
			>
				卖出
			</button>
		</div>
		<div>
			<Input
				classNames={{
					inputWrapper: "mt-[24px] h-[48px] !border-[#303135] bg-[rgba(13,15,19,0.35)] !border-[1.5px] rounded-[8px] hover:!border-[#303135] focus-within:!border-[#303135]",
					input: "text-[20px] text-[#FFF] font-semibold placeholder:text-[#868789] uppercase tracking-[-0.07px] text-right",
				}}
				name="amount"
				placeholder="0"
				variant="bordered"
				value={amount}
				isDisabled={false}
				onChange={(e) => {
					const value = e.target.value;
					if (value === '' || /^\d*\.?\d{0,6}$/.test(value)) {
						const formattedValue = value.startsWith('.') ? '0' + value : value;
						setAmount(formattedValue);
						setAmountValue(formattedValue);
					}
				}}
				startContent={<div className="shrink-0 flex items-center gap-[8px] pl-[2px] min-w-0 max-w-[45%]">
					<div className="shrink-0">
						{side === 'buy' ? <MyAvatar src="/images/origin.png" alt="icon" className="w-[24px] h-[24px] bg-[transparent]" /> : <MyAvatar src={tokenAvatar} alt="icon" className="w-[24px] h-[24px] bg-[transparent]" />}
					</div>
					<div className="text-[16px] text-[#fff] truncate">{side === 'buy' ? originSymbol : tokenSymbol}</div>
				</div>}
			/>
		</div>
		<div className="h-[48px] flex items-center justify-between">
			<div className="text-[13px] text-[#868789] flex items-center min-w-0 whitespace-nowrap">钱包余额
				<span className="text-[#fff] mx-[4px] truncate max-w-[120px] min-w-0">{balanceText} {balanceSymbol}</span>
			</div>
			<div className="flex items-center gap-[4px] text-[12px] text-[#868789]">
				滑点<span className="text-[#fff]">{slippage}%</span>
				<SettingIcon className="cursor-pointer" onClick={() => setIsSlippageOpen(true)} />
			</div>
		</div>
		<div className="h-[48px] border-[1px] border-dashed border-[#303135] rounded-[8px] flex items-center justify-between px-[12px]">
			<div className="text-[13px] text-[#868789]">预计获得</div>
			<div className="flex items-center gap-[4px]">
				{side === 'sell' ? <MyAvatar src="/images/origin.png" alt="icon" className="w-[16px] h-[16px] bg-[transparent]" /> : <MyAvatar src={tokenAvatar} alt="icon" className="w-[16px] h-[16px] bg-[transparent]" />}
				<span className="text-[13px] text-[#fff]">{estimatedAmount}</span>
			</div>
		</div>
		{
			side === 'buy' ? (
				<Button
					fullWidth
					className="h-[44px] rounded-[12px] bg-[#FD7438] text-[15px] mt-[24px]"
					isLoading={isApproving || isSwapping}
					isDisabled={isActionDisabled}
					onPress={() => {
						if (!address) {
							toLogin();
							return;
						}
						handleBuy();
					}}
				>
					{actionLabel}
				</Button>
			) : (
				<Button
					fullWidth
					className="h-[44px] rounded-[12px] bg-[#FF5160] text-[15px] mt-[24px]"
					isLoading={isApproving || isSwapping}
					isDisabled={isActionDisabled}
					onPress={() => {
						if (!address) {
							toLogin();
							return;
						}
						handleSell();
					}}
				>
					{actionLabel}
				</Button>
			)
		}
		<SlippageModal
			isOpen={isSlippageOpen}
			onClose={() => setIsSlippageOpen(false)}
		/>
	</div>;
}
