import MyAvatar from "@/components/avatar";
import { Button } from "@heroui/react";
import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";
import { getUserAsset } from "@/service/api";
import { format8 } from "@/utils/number";
import BigNumber from "bignumber.js";

type MiningRewardsProps = {
	coinInfo?: any;
};

export default function MiningRewards({ coinInfo }: MiningRewardsProps) {
	const { address } = useAuthStore();
	const mint = coinInfo?.mint;
	const { data: userAsset } = useQuery({
		queryKey: ["miningUserAsset", address, mint],
		queryFn: async () => {
			const result = await getUserAsset({
				user_addr: address,
				mint,
			});
			return result?.data;
		},
		enabled: !!address && !!mint,
		refetchInterval: 3000,
	});
	const tokenSymbol = coinInfo?.symbol ?? "--";
	const tokenAvatar = coinInfo?.image_url || "/images/default.png";
	const unrefinedAmount = userAsset?.amount ?? "0";
	const refinedAmount = userAsset?.native_amount ?? "0";
	const canClaim = (() => {
		const unrefined = new BigNumber(unrefinedAmount);
		const refined = new BigNumber(refinedAmount);
		if (!unrefined.isFinite() && !refined.isFinite()) return false;
		return unrefined.gt(0) || refined.gt(0);
	})();

	return <div className="w-full">
		<div className="text-[18px] text-[#fff] font-semibold">挖矿奖励</div>
		<div className="mt-[12px] border-[#25262A] border-[1px] border-dashed p-[12px] rounded-[8px]">
			<div className="flex items-center justify-between text-[13px] text-[#868789] whitespace-nowrap">
				<div className="flex-1 truncate">未精炼 <span className="truncate">{tokenSymbol}</span></div>
				<div className="text-[#fff] flex items-center gap-[4px]">
					<MyAvatar src={tokenAvatar} alt="icon" className="w-[16px] h-[16px] bg-[transparent] grayscale" />
					{format8(unrefinedAmount)}
				</div>
			</div>
			<div className="flex items-center justify-between text-[13px] text-[#868789] mt-[12px] whitespace-nowrap">
				<div className="flex-1 truncate">精炼 <span className="truncate">{tokenSymbol}</span></div>
				<div className="text-[#fff] flex items-center gap-[4px]">
					<MyAvatar src={tokenAvatar} alt="icon" className="w-[16px] h-[16px] bg-[transparent]" />
					{format8(refinedAmount)}
				</div>
			</div>
			<Button
				radius="full"
				fullWidth
				isDisabled={!canClaim}
				className="h-[44px] mt-[16px] bg-[transparent] text-[15px] text-[#FD7438] border-[1px] border-[#FD7438] disabled:opacity-60 disabled:text-[#868789] disabled:border-[#36383B]"
			>
				领取
			</Button>
		</div>
	</div>;
}
