import MyAvatar from "@/components/avatar";
import { getGameInfo } from "@/service/api";
import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { format8 } from "@/utils/number";
import { LogoIcon } from "./icons";

type MiningAboutProps = {
	coinInfo?: any;
};

export default function MiningAbout({ coinInfo }: MiningAboutProps) {
	const { address } = useAuthStore();
	const [countdown, setCountdown] = useState("00:00:00");
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
	useEffect(() => {
		const endTs = info?.end_ts;
		if (!endTs || Number.isNaN(Number(endTs))) {
			setCountdown("00:00:00");
			return;
		}

		const updateCountdown = () => {
			const remainingMs = Math.max(0, Number(endTs) * 1000 - Date.now());
			const totalSeconds = Math.floor(remainingMs / 1000);
			const hours = Math.floor(totalSeconds / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = totalSeconds % 60;
			const pad2 = (value: number) => String(value).padStart(2, "0");
			setCountdown(`${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`);
		};

		updateCountdown();
		const timer = setInterval(updateCountdown, 1000);
		return () => clearInterval(timer);
	}, [info?.end_ts]);

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
					<div className="text-[12px] text-[#4A4B4E]">母矿奖池 / 本轮发放</div>
				</div>
				<div className="flex-1 flex flex-col items-center justify-center gap-[4px]">
					<div className="text-[16px] text-[#fff]">{countdown}</div>
					<div className="text-[12px] text-[#4A4B4E]">#{info?.round_id}</div>
				</div>
			</div>
			<div className="p-[12px] border-t-[1px] border-[#25262A] flex flex-col gap-[8px]">
				<div className="flex items-center justify-between text-[12px] text-[#868789]">
					我的交易量 / 全局交易量
					<div className="text-[#fff] flex items-center gap-[4px]">
						{/* <MyAvatar src={coinInfo?.image_url || "/images/default.png"} alt="icon" className="w-[12px] h-[12px] bg-[transparent]" /> */}
						<LogoIcon className="w-[12px] h-[12px]" />
						<span>{format8(info?.my_trade_volume)}</span>
						<span className="text-[#4A4B4E] text-[12px]">/</span>
						{/* <MyAvatar src={coinInfo?.image_url || "/images/default.png"} alt="icon" className="w-[12px] h-[12px] bg-[transparent]" /> */}
						<LogoIcon className="w-[12px] h-[12px]" />
						<span>{format8(info?.all_trade_volume)}</span>
					</div>
				</div>
				<div className="flex items-center justify-between text-[12px] text-[#868789]">
					我的占比
					<div className="text-[#fff]">{info?.my_ratio}%</div>
				</div>
				<div className="flex items-center justify-between text-[12px] text-[#868789]">
					预计获得
					<div className="text-[#fff] flex items-center gap-[4px]">
						<MyAvatar src={coinInfo?.image_url || "/images/default.png"} alt="icon" className="w-[12px] h-[12px] bg-[transparent] grayscale" />
						{format8(info?.expect_reward)}
					</div>
				</div>
			</div>
		</div>
	);
}
