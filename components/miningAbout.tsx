import MyAvatar from "@/components/avatar";
import { getGameInfo } from "@/service/api";
import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format8 } from "@/utils/number";
import { InfoIcon, LogoIcon } from "./icons";
import useCountdown from "@/hooks/useCountdown";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";

type MiningAboutProps = {
	coinInfo?: any;
};

export default function MiningAbout({ coinInfo }: MiningAboutProps) {
	const { t } = useTranslation();
	const { address } = useAuthStore();
	const miningAddress = coinInfo?.mint;
	const { data: gameInfo } = useQuery({
		queryKey: ["gameInfo", address, miningAddress],
		queryFn: () =>
			getGameInfo({
				user_addr: address,
				mining_address: miningAddress,
			}),
		enabled: !!address && !!miningAddress && coinInfo?.is_refine === 1,
		refetchInterval: 3000,
	});

	const info = gameInfo?.data ?? {};
	const isTradeMode = info?.is_trade;
	const volumeLabel = isTradeMode ? t("Game.netBuys") : t("Game.netBuy");
	const myAndGlobalLabel = isTradeMode
		? t("MiningAbout.myAndGlobalVolumeTrade")
		: t("MiningAbout.myAndGlobalVolumeNetBuy");

	return (
		<div className="w-full rounded-[8px] overflow-hidden border-[1px] border-[#25262A]">
			<div className="h-[60px] bg-[#191B1F] flex">
				<div className="flex-1 border-r-[1px] border-[#25262A] flex flex-col items-center justify-center gap-[4px]">
					<div className="text-[16px] text-[#fff] flex items-center gap-[4px]">
						<MyAvatar src={coinInfo?.image_url || "/images/default.png"} alt="icon" className="w-[18px] h-[18px] bg-[transparent] grayscale" />
						<span>{format8(info?.game_mother_reward)}</span>
						<span className="text-[#4A4B4E] text-[12px]">/</span>
						<MyAvatar src={coinInfo?.image_url || "/images/default.png"} alt="icon" className="w-[18px] h-[18px] bg-[transparent] grayscale" />
						<span>{format8(info?.game_round_rewards)}</span>
					</div>
					<div className="text-[12px] text-[#4A4B4E]">{t("MiningAbout.motherPoolAndRound")}</div>
				</div>
				<div className="flex-1 flex flex-col items-center justify-center gap-[4px]">
					<div className="text-[16px] text-[#fff]">{useCountdown(info?.end_ts)}</div>
					<div className="text-[12px] text-[#4A4B4E]">#{info?.round_id}</div>
				</div>
			</div>
			<div className="p-[12px] border-t-[1px] border-[#25262A] flex flex-col gap-[8px]">
				<div className="flex items-center justify-between text-[12px] text-[#868789]">
					{myAndGlobalLabel}
					<div className="text-[#fff] flex items-center gap-[4px]">
						<LogoIcon className="w-[12px] h-[12px]" />
						<span>{format8(info?.my_trade_volume)}</span>
						<span className="text-[#4A4B4E] text-[12px]">/</span>
						<LogoIcon className="w-[12px] h-[12px]" />
						<span>{format8(info?.all_trade_volume)}</span>
						<Popover placement="top" showArrow={true}>
							<PopoverTrigger>
								<div><InfoIcon className="cursor-pointer w-[12px] h-[12px]" /></div>
							</PopoverTrigger>
							<PopoverContent>
								<div className="max-w-[270px] text-[12px] text-[#E6E6E6]">
									{t("MiningAbout.activateDesc", {
										metric: volumeLabel,
										volume: format8(info?.min_active_amount),
									})}
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>
				<div className="flex items-center justify-between text-[12px] text-[#868789]">
					{t("MiningAbout.myRatio")}
					<div className="text-[#fff]">{info?.my_ratio}%</div>
				</div>
				<div className="flex items-center justify-between text-[12px] text-[#868789]">
					{t("MiningAbout.estimatedRewards")}
					<div className="text-[#fff] flex items-center gap-[4px]">
						<MyAvatar src={coinInfo?.image_url || "/images/default.png"} alt="icon" className="w-[12px] h-[12px] bg-[transparent] grayscale" />
						{format8(info?.expect_reward)}
						<Popover placement="top" showArrow={true}>
							<PopoverTrigger>
								<div><InfoIcon className="cursor-pointer w-[12px] h-[12px]" /></div>
							</PopoverTrigger>
							<PopoverContent>
								<div className="max-w-[270px] text-[12px] text-[#E6E6E6]">
									{t("MiningAbout.activateDesc", {
										metric: volumeLabel,
										volume: format8(info?.min_active_amount),
									})}
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</div>
		</div>
	);
}
