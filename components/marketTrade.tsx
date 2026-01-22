import MyAvatar from "@/components/avatar";
import { useState } from "react";
import { Input, Button } from "@heroui/react";
import { BNBIcon, SettingIcon } from "./icons";
import { useBalanceContext } from "@/providers/balanceProvider";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { useAuthStore } from "@/stores/auth";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";
import IERC20Abi from "@/constant/IERC20.json";
import TokenFactoryAbi from "@/constant/TokenFactory.json";
import { DEFAULT_CHAIN_CONFIG, DEFAULT_CHAIN_ID } from "@/config/chains";
import BigNumber from "bignumber.js";
import { SlippageModal } from "./slippageModal";
import { useQueryClient } from "@tanstack/react-query";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useSlippageStore } from "@/stores/slippage";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/utils/toastHelpers";
import usePrivyLogin from "@/hooks/usePrivyLogin";

type MarketTradeProps = {
	coinInfo?: any;
	side?: "buy" | "sell";
	onSideChange?: (next: "buy" | "sell") => void;
};

export default function MarketTrade({ coinInfo, side, onSideChange }: MarketTradeProps) {
	const buyAmountList = [0.1, 0.2, 0.5];
	const sellPercentList = [10, 20, 50];
	const [localSide, setLocalSide] = useState<"buy" | "sell">("buy");
	const [amount, setAmount] = useState("");
	const [amountValue, setAmountValue] = useState("");
	const [isSlippageOpen, setIsSlippageOpen] = useState(false);
	const [isSelling, setIsSelling] = useState(false);
	const { slippage, setSlippage } = useSlippageStore();
	const tokenSymbol = coinInfo?.symbol ?? "--";
	const tokenAvatar = coinInfo?.image_url || "/images/default.png";
	const currentSide = side ?? localSide;
	const { balance, symbol } = useBalanceContext();
	const { address } = useAuthStore();
	const { toLogin } = usePrivyLogin();
	const tokenFactoryAddress = DEFAULT_CHAIN_CONFIG?.tokenFactory as `0x${string}` | undefined;
	const publicClient = usePublicClient({ chainId: DEFAULT_CHAIN_ID });
	const { writeContractAsync, isPending: isTxPending } = useWriteContract();
	const queryClient = useQueryClient();
	const { tokenBalanceValue, tokenBalanceText, refetchTokenBalance } = useTokenBalance(
		coinInfo?.mint as `0x${string}` | undefined,
		18,
	);
	const walletBalanceText =
		currentSide === "buy"
			? `${formatBigNumber(balance)} ${symbol}`
			: `${tokenBalanceText} ${tokenSymbol}`;
	const isBuy = currentSide === "buy";
	const amountWei = (() => {
		const source = amountValue || amount;
		if (!source) return 0n;
		const bn = new BigNumber(source);
		if (!bn.isFinite() || bn.lte(0)) return 0n;
		const scaled = bn.multipliedBy(new BigNumber(10).pow(18)).integerValue(BigNumber.ROUND_DOWN);
		return BigInt(scaled.toFixed(0));
	})();
	const { data: quoteData } = useReadContract({
		address: tokenFactoryAddress,
		abi: (TokenFactoryAbi as any).abi ?? TokenFactoryAbi,
		functionName: isBuy ? "tryBuy" : "trySell",
		args: tokenFactoryAddress && coinInfo?.mint && amountWei > 0n ? [coinInfo?.mint, amountWei] : undefined,
		chainId: DEFAULT_CHAIN_ID,
		query: { enabled: !!tokenFactoryAddress && !!coinInfo?.mint && amountWei > 0n, refetchInterval: 3000 },
	});
	console.log(quoteData)

	const estimatedAmount = (() => {
		if (!quoteData) return "0";
		if (isBuy) {
			const [tokenAmountOut] = quoteData as readonly [bigint, bigint];
			return formatBigNumber(tokenAmountOut ?? 0n, { decimals: 18, compact: false, withComma: true, precision: 4, trimTrailingZero: true });
		}
		return formatBigNumber(quoteData as bigint, { decimals: 18, compact: false, withComma: true, precision: 4, trimTrailingZero: true });
	})();
	const minAmountOut = (() => {
		if (!quoteData || !isBuy) return 0n;
		const [tokenAmountOut] = quoteData as readonly [bigint, bigint];
		const outBn = new BigNumber(tokenAmountOut?.toString() ?? "0");
		if (!outBn.isFinite() || outBn.lte(0)) return 0n;
		const minOut = outBn
			.multipliedBy(new BigNumber(100).minus(slippage))
			.dividedBy(100)
			.integerValue(BigNumber.ROUND_DOWN);
		return BigInt(minOut.toFixed(0));
	})();
	const isActionDisabled = address
		? !amount || amountWei <= 0n || (isBuy ? minAmountOut <= 0n : false)
		: false;
	const actionLabel = address ? (isBuy ? "立即买入" : "立即卖出") : "Connect Wallet";
	const setSellAmountPercent = (percent: number) => {
		const bn = new BigNumber(tokenBalanceValue.toString());
		if (!bn.isFinite() || bn.isZero()) {
			setAmount("0");
			return;
		}
		const amountBn = bn
			.dividedBy(new BigNumber(10).pow(18))
			.multipliedBy(percent)
			.dividedBy(100)
			.decimalPlaces(18, BigNumber.ROUND_DOWN);
		const fullValue = amountBn.toFixed();
		const displayValue = amountBn.decimalPlaces(6, BigNumber.ROUND_DOWN).toFixed(6);
		setAmountValue(fullValue);
		setAmount(displayValue);
	};
	const setCurrentSide = (next: "buy" | "sell") => {
		if (onSideChange) onSideChange(next);
		if (!side) setLocalSide(next);
		setAmount("");
		setAmountValue("");
	};
	const handleBuy = async () => {
		if (!address) {
			toLogin();
			return;
		}
		if (!tokenFactoryAddress || !coinInfo?.mint || amountWei <= 0n || !publicClient) return;
		try {
			const actionText = "买入";
			const quote = await publicClient.readContract({
				address: tokenFactoryAddress,
				abi: (TokenFactoryAbi as any).abi ?? TokenFactoryAbi,
				functionName: "tryBuy",
				args: [coinInfo.mint, amountWei],
			});
			const [tokenAmountOut] = quote as readonly [bigint, bigint];
			const outBn = new BigNumber(tokenAmountOut?.toString() ?? "0");
			if (!outBn.isFinite() || outBn.lte(0)) return;
			const minOut = outBn
				.multipliedBy(new BigNumber(100).minus(slippage))
				.dividedBy(100)
				.integerValue(BigNumber.ROUND_DOWN);
			const minAmountOut = BigInt(minOut.toFixed(0));
			if (minAmountOut <= 0n) return;
			const hash = await writeContractAsync({
				address: tokenFactoryAddress,
				abi: (TokenFactoryAbi as any).abi ?? TokenFactoryAbi,
				functionName: "buyToken",
				args: [coinInfo.mint, amountWei, minAmountOut],
				value: amountWei,
				chainId: DEFAULT_CHAIN_ID,
			});
			if (hash) {
				console.log("buyToken submitted:", hash);
				showLoadingToast(`${actionText}已发起`, `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
			}
			if (publicClient && hash) {
				await publicClient.waitForTransactionReceipt({ hash });
				console.log("buyToken confirmed:", hash);
				showSuccessToast(`${actionText}成功`, `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
				setAmount("");
				setAmountValue("");
				refetchTokenBalance();
				if (address) {
					queryClient.invalidateQueries({ queryKey: ["balance", address] });
				}
			}
		} catch (error) {
			console.error("buyToken error:", error);
			showErrorToast("买入失败");
		}
	};
	const handleSell = async () => {
		if (!address) {
			toLogin();
			return;
		}
		if (!tokenFactoryAddress || !coinInfo?.mint || amountWei <= 0n || !publicClient) return;
		setIsSelling(true);
		try {
			const actionText = "卖出";
			const allowance = await publicClient.readContract({
				address: coinInfo.mint,
				abi: (IERC20Abi as any).abi ?? IERC20Abi,
				functionName: "allowance",
				args: [address as `0x${string}`, tokenFactoryAddress],
			});
			const allowanceValue = (allowance ?? 0n) as bigint;
			if (allowanceValue < amountWei) {
				const approveHash = await writeContractAsync({
					address: coinInfo.mint,
					abi: (IERC20Abi as any).abi ?? IERC20Abi,
					functionName: "approve",
					args: [tokenFactoryAddress, amountWei],
					chainId: DEFAULT_CHAIN_ID,
				});
				if (approveHash) {
					console.log("approve submitted:", approveHash);
					await publicClient.waitForTransactionReceipt({ hash: approveHash });
					console.log("approve confirmed:", approveHash);
				}
			}
			const quote = await publicClient.readContract({
				address: tokenFactoryAddress,
				abi: (TokenFactoryAbi as any).abi ?? TokenFactoryAbi,
				functionName: "trySell",
				args: [coinInfo.mint, amountWei],
			});
			const outBn = new BigNumber((quote as bigint)?.toString() ?? "0");
			if (!outBn.isFinite() || outBn.lte(0)) return;
			const minOut = outBn
				.multipliedBy(new BigNumber(100).minus(slippage))
				.dividedBy(100)
				.integerValue(BigNumber.ROUND_DOWN);
			const minAmountOut = BigInt(minOut.toFixed(0));
			if (minAmountOut <= 0n) return;
			const hash = await writeContractAsync({
				address: tokenFactoryAddress,
				abi: (TokenFactoryAbi as any).abi ?? TokenFactoryAbi,
				functionName: "sellToken",
				args: [coinInfo.mint, amountWei, minAmountOut],
				chainId: DEFAULT_CHAIN_ID,
			});
			if (hash) {
				console.log("sellToken submitted:", hash);
				showLoadingToast(`${actionText}已发起`, `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
			}
			if (publicClient && hash) {
				await publicClient.waitForTransactionReceipt({ hash });
				console.log("sellToken confirmed:", hash);
				showSuccessToast(`${actionText}成功`, `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
				setAmount("");
				setAmountValue("");
				refetchTokenBalance();
				if (address) {
					queryClient.invalidateQueries({ queryKey: ["balance", address] });
				}
			}
		} catch (error) {
			console.error("sellToken error:", error);
			showErrorToast("卖出失败");
		} finally {
			setIsSelling(false);
		}
	};

	return <div className="rounded-[8px] py-[16px] md:p-[12px] bg-[#191B1F] border-[0px] md:border-[1px] border-[#25262A]">
		<div className="hidden md:flex h-[36px] bg-[#25262A] rounded-[8px]">
			<button
				type="button"
				onClick={() => setCurrentSide("buy")}
				className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${currentSide === "buy"
					? "bg-[rgba(23,201,100,0.15)] border-[#17C964] text-[#E9FFEF]"
					: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
					}`}
			>
				买入
			</button>
			<button
				type="button"
				onClick={() => setCurrentSide("sell")}
				className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${currentSide === "sell"
					? "bg-[rgba(255,81,96,0.15)] border-[#FF5160] text-[#FFE9EB]"
					: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
					}`}
			>
				卖出
			</button>
		</div>
		<div>
			<Input
				classNames={{
					inputWrapper: "mt-0 md:mt-[24px] h-[48px] !border-[#303135] bg-[rgba(13,15,19,0.35)] !border-[1.5px] rounded-[8px] hover:!border-[#303135] focus-within:!border-[#303135]",
					input: "text-[20px] text-[#FFF] font-semibold placeholder:text-[#868789] uppercase tracking-[-0.07px] text-right",
				}}
				name="amount"
				placeholder="0"
				variant="bordered"
				value={amount}
				isDisabled={false}
				onChange={(e) => {
					const value = e.target.value;
					const regex = /^\d*\.?\d{0,6}$/;
					if (value === '' || regex.test(value)) {
						const formattedValue = value.startsWith('.') ? '0' + value : value;
						setAmount(formattedValue);
						setAmountValue(formattedValue);
					}
				}}
				startContent={<div className="shrink-0 flex items-center gap-[8px] pl-[2px] min-w-0 max-w-[45%]">
					<div className="shrink-0">
						{currentSide === 'buy' ? <BNBIcon /> : <MyAvatar src={tokenAvatar} alt="icon" className="w-[24px] h-[24px] bg-[transparent]" />}
					</div>
					<div className="text-[16px] text-[#fff] truncate">{currentSide === 'buy' ? "BNB" : tokenSymbol}</div>
				</div>}
			/>
		</div>
		<div className="h-[48px] flex items-center justify-between">
			<div className="text-[13px] text-[#868789] flex items-center min-w-0 whitespace-nowrap">钱包余额
				<span className="text-[#fff] mx-[4px] truncate max-w-[120px] min-w-0">{walletBalanceText}</span>
				{currentSide === 'buy' && <span className="text-[#17C964] cursor-pointer">充值</span>}
			</div>
			<div className="flex gap-[4px]">
				{currentSide === "buy"
					? buyAmountList.map((num) => (
						<div
							key={num}
							className="text-[12px] text-[#868789] w-[44px] h-[24px] rounded-[6px] bg-[#25262A] flex items-center justify-center cursor-pointer"
							onClick={() => setAmount(String(num))}
						>
							{num}
						</div>
					))
					: (
						<>
							{sellPercentList.map((num) => (
								<div
									key={num}
									className="text-[12px] text-[#868789] w-[44px] h-[24px] rounded-[6px] bg-[#25262A] flex items-center justify-center cursor-pointer"
									onClick={() => setSellAmountPercent(num)}
								>
									{num}%
								</div>
							))}
							<div
								className="text-[12px] text-[#868789] w-[44px] h-[24px] rounded-[6px] bg-[#25262A] flex items-center justify-center cursor-pointer"
								onClick={() => setSellAmountPercent(100)}
							>
								Max
							</div>
						</>
					)}
			</div>
		</div>
		<div className="border-[1px] border-dashed border-[#303135] rounded-[8px] px-[12px] py-[16px]">
			<div className="flex items-center justify-between">
				<div className="text-[13px] text-[#868789]">预计获得</div>
				<div className="flex items-center gap-[4px]">
					{currentSide === 'sell' ? <BNBIcon className="w-[16px] h-[16px]" /> : <MyAvatar src={tokenAvatar} alt="icon" className="w-[16px] h-[16px] bg-[transparent]" />}
					<span className="text-[13px] text-[#fff]">{estimatedAmount}</span>
				</div>
			</div>
			<div className="flex items-center justify-between mt-[10px]">
				<div className="text-[13px] text-[#868789]">滑点</div>
				<div className="flex items-center text-[13px] text-[#fff] gap-[4px]">
					<span>{slippage}%</span>
					<SettingIcon className="cursor-pointer" onClick={() => setIsSlippageOpen(true)} />
				</div>
			</div>
		</div>
		{
			currentSide === 'buy' ? (
				<Button
					fullWidth
					className="h-[44px] rounded-[12px] bg-[#1ACD67] text-[15px] mt-[24px]"
					isLoading={isTxPending}
					isDisabled={isActionDisabled}
					onPress={handleBuy}
				>
					{actionLabel}
				</Button>
			) : (
				<Button
					fullWidth
					className="h-[44px] rounded-[12px] bg-[#FF5160] text-[15px] mt-[24px]"
					isLoading={isTxPending || isSelling}
					isDisabled={isActionDisabled}
					onPress={handleSell}
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
