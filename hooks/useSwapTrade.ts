import { useMemo, useState } from "react";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";
import BigNumber from "bignumber.js";
import SwapRouterAbi from "@/constant/swapRouter.json";
import IERC20Abi from "@/constant/IERC20.json";
import { DEFAULT_CHAIN_ID } from "@/config/chains";
import { useAuthStore } from "@/stores/auth";
import { formatBigNumber } from "@/utils/formatBigNumber";

type SwapSide = "buy" | "sell";

type UseSwapTradeParams = {
	coinInfo?: any;
	side: SwapSide;
	amount: string;
	amountValue?: string;
	slippage: number;
	originAddress?: `0x${string}`;
	swapRouterAddress?: `0x${string}`;
	outDecimals?: number;
	onSwapSubmitted?: (payload: { hash: `0x${string}`; side: SwapSide }) => void;
	onSwapSuccess?: (payload: { hash: `0x${string}`; side: SwapSide }) => void;
	onSwapError?: (payload: { side: SwapSide }) => void;
};

export function useSwapTrade({
	coinInfo,
	side,
	amount,
	amountValue,
	slippage,
	originAddress,
	swapRouterAddress,
	outDecimals = 18,
	onSwapSubmitted,
	onSwapSuccess,
	onSwapError,
}: UseSwapTradeParams) {
	const { address } = useAuthStore();
	const publicClient = usePublicClient({ chainId: DEFAULT_CHAIN_ID });
	const { writeContractAsync } = useWriteContract();
	const [isApproving, setIsApproving] = useState(false);
	const [isSwapping, setIsSwapping] = useState(false);

	const amountWei = useMemo(() => {
		const source = amountValue || amount;
		if (!source) return 0n;
		const bn = new BigNumber(source);
		if (!bn.isFinite() || bn.lte(0)) return 0n;
		const scaled = bn.multipliedBy(new BigNumber(10).pow(18)).integerValue(BigNumber.ROUND_DOWN);
		return BigInt(scaled.toFixed(0));
	}, [amount, amountValue]);

	const tokenIn = side === "buy" ? originAddress : (coinInfo?.mint as `0x${string}` | undefined);
	const tokenOut = side === "buy" ? (coinInfo?.mint as `0x${string}` | undefined) : originAddress;

	const { data: amountOut } = useReadContract({
		address: swapRouterAddress,
		abi: (SwapRouterAbi as any).abi ?? SwapRouterAbi,
		functionName: "getAmountOut",
		args: tokenIn && tokenOut && amountWei > 0n ? [tokenIn, tokenOut, amountWei, 10000] : undefined,
		chainId: DEFAULT_CHAIN_ID,
		query: {
			enabled: !!swapRouterAddress && !!tokenIn && !!tokenOut && amountWei > 0n,
			refetchInterval: 3000,
		},
	});

	const estimatedAmountRaw = useMemo(() => {
		if (!amountOut) return "";
		const outBn = new BigNumber((amountOut as bigint).toString())
			.dividedBy(new BigNumber(10).pow(outDecimals))
			.decimalPlaces(6, BigNumber.ROUND_DOWN);
		if (!outBn.isFinite() || outBn.lte(0)) return "";
		return outBn.toFixed();
	}, [amountOut, outDecimals]);

	const estimatedAmount = amountOut
		? formatBigNumber(amountOut as bigint, {
			decimals: outDecimals,
			compact: false,
			withComma: true,
			precision: 4,
			trimTrailingZero: true,
		})
		: "0";

	const minAmountOut = useMemo(() => {
		if (!amountOut) return 0n;
		const outBn = new BigNumber((amountOut as bigint).toString());
		if (!outBn.isFinite() || outBn.lte(0)) return 0n;
		const minOut = outBn
			.multipliedBy(new BigNumber(100).minus(slippage))
			.dividedBy(100)
			.integerValue(BigNumber.ROUND_DOWN);
		return BigInt(minOut.toFixed(0));
	}, [amountOut, slippage]);

	const handleBuy = async () => {
		if (!swapRouterAddress || !originAddress || !coinInfo?.mint || amountWei <= 0n || minAmountOut <= 0n || !publicClient) return;
		if (!address) return;
		try {
			const allowance = await publicClient.readContract({
				address: originAddress,
				abi: (IERC20Abi as any).abi ?? IERC20Abi,
				functionName: "allowance",
				args: [address as `0x${string}`, swapRouterAddress],
			});
			const allowanceValue = (allowance ?? 0n) as bigint;
			if (allowanceValue < amountWei) {
				setIsApproving(true);
				try {
					const approveHash = await writeContractAsync({
						address: originAddress,
						abi: (IERC20Abi as any).abi ?? IERC20Abi,
						functionName: "approve",
						args: [swapRouterAddress, amountWei],
						chainId: DEFAULT_CHAIN_ID,
					});
					if (publicClient && approveHash) {
						await publicClient.waitForTransactionReceipt({ hash: approveHash });
					}
				} finally {
					setIsApproving(false);
				}
			}
			setIsSwapping(true);
			const hash = await writeContractAsync({
				address: swapRouterAddress,
				abi: (SwapRouterAbi as any).abi ?? SwapRouterAbi,
				functionName: "swapFixedTokenForMeme",
				args: [coinInfo.mint, amountWei, minAmountOut, 10000],
				chainId: DEFAULT_CHAIN_ID,
			});
			if (hash) {
				onSwapSubmitted?.({ hash, side: "buy" });
			}
			if (publicClient && hash) {
				await publicClient.waitForTransactionReceipt({ hash });
				onSwapSuccess?.({ hash, side: "buy" });
			}
		} catch (error) {
			console.error("swapFixedTokenForMeme error:", error);
			onSwapError?.({ side: "buy" });
		} finally {
			setIsSwapping(false);
		}
	};

	const handleSell = async () => {
		if (!swapRouterAddress || !coinInfo?.mint || amountWei <= 0n || minAmountOut <= 0n || !publicClient) return;
		if (!address) return;
		try {
			const allowance = await publicClient.readContract({
				address: coinInfo.mint,
				abi: (IERC20Abi as any).abi ?? IERC20Abi,
				functionName: "allowance",
				args: [address as `0x${string}`, swapRouterAddress],
			});
			const allowanceValue = (allowance ?? 0n) as bigint;
			if (allowanceValue < amountWei) {
				setIsApproving(true);
				try {
					const approveHash = await writeContractAsync({
						address: coinInfo.mint,
						abi: (IERC20Abi as any).abi ?? IERC20Abi,
						functionName: "approve",
						args: [swapRouterAddress, amountWei],
						chainId: DEFAULT_CHAIN_ID,
					});
					if (publicClient && approveHash) {
						await publicClient.waitForTransactionReceipt({ hash: approveHash });
					}
				} finally {
					setIsApproving(false);
				}
			}
			setIsSwapping(true);
			const hash = await writeContractAsync({
				address: swapRouterAddress,
				abi: (SwapRouterAbi as any).abi ?? SwapRouterAbi,
				functionName: "swapMemeForFixedToken",
				args: [coinInfo.mint, amountWei, minAmountOut, 10000],
				chainId: DEFAULT_CHAIN_ID,
			});
			if (hash) {
				onSwapSubmitted?.({ hash, side: "sell" });
			}
			if (publicClient && hash) {
				await publicClient.waitForTransactionReceipt({ hash });
				onSwapSuccess?.({ hash, side: "sell" });
			}
		} catch (error) {
			console.error("swapMemeForFixedToken error:", error);
			onSwapError?.({ side: "sell" });
		} finally {
			setIsSwapping(false);
		}
	};

	return {
		amountWei,
		estimatedAmountRaw,
		estimatedAmount,
		minAmountOut,
		handleBuy,
		handleSell,
		isApproving,
		isSwapping,
	};
}
