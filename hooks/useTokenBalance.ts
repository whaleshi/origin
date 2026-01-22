import { useReadContract } from "wagmi";
import { useAuthStore } from "@/stores/auth";
import IERC20Abi from "@/constant/IERC20.json";
import { DEFAULT_CHAIN_ID } from "@/config/chains";
import { formatBigNumber } from "@/utils/formatBigNumber";

export function useTokenBalance(tokenAddress?: `0x${string}`, decimals = 18) {
	const { address } = useAuthStore();
	const { data, refetch, isFetching } = useReadContract({
		address: tokenAddress,
		abi: (IERC20Abi as any).abi ?? IERC20Abi,
		functionName: "balanceOf",
		args: address ? [address as `0x${string}`] : undefined,
		chainId: DEFAULT_CHAIN_ID,
		query: { enabled: !!address && !!tokenAddress, refetchInterval: 3000 },
	});
	const tokenBalanceValue = (data ?? 0n) as bigint;
	const tokenBalanceText =
		address && tokenAddress
			? formatBigNumber(tokenBalanceValue, { decimals })
			: "--";

	return {
		tokenBalance: data,
		tokenBalanceValue,
		tokenBalanceText,
		refetchTokenBalance: refetch,
		isFetchingTokenBalance: isFetching,
	};
}
