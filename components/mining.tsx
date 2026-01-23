import MyAvatar from "@/components/avatar";
import { Image } from "@heroui/react";
import { BottomTokenIcon } from "./icons";
import MiningTrade from "./miningTrade";
import MiningRewards from "./miningRewards";
import MiningAbout from "./miningAbout";
import { MiningList } from "./miningList";
import ScrollingName from "./scrollingName";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { formatPercent, getPercentClass } from "@/utils/number";
import { SwapList } from "./swapList";
import ListDialog from "./listDialog";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type MiningProps = {
	coinInfo?: any;
};

export default function Mining({ coinInfo }: MiningProps) {
	const { t } = useTranslation();
	const router = useRouter();
	const [isListDialogOpen, setIsListDialogOpen] = useState(false);
	const changeValue = coinInfo?.price_change_24h_f ?? coinInfo?.price_change_24h ?? coinInfo?.change_24h;
	const displayChange = formatPercent(changeValue, "0.00%");
	const changeClass = getPercentClass(changeValue);

	if (coinInfo?.is_refine === 0) {
		return <div className="flex flex-col items-center pt-[200px]">
			<Image src="/images/mining.png" alt="Mining" disableAnimation disableSkeleton className="w-[80px] h-[80px]" />
			<div className="text-[14px] text-[#868789]">{t("Mining.pendingActivation")}</div>
		</div>
	}

	return <div className="w-full max-w-[600px]">
		<div className="mt-[20px] flex items-center rounded-[12px] p-[12px] spin-border">
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
			<BottomTokenIcon className="cursor-pointer ml-[12px]" onClick={() => setIsListDialogOpen(true)} />
		</div>
		<div className="my-[12px]"><MiningAbout coinInfo={coinInfo} /></div>
		<div><MiningTrade coinInfo={coinInfo} /></div>
		<div className="mt-[24px]"><MiningRewards coinInfo={coinInfo} /></div>
		<div><MiningList coinInfo={coinInfo} /></div>
		<div className="mt-[20px]"><SwapList coinInfo={coinInfo} /></div>
		<ListDialog
			isOpen={isListDialogOpen}
			onOpenChange={setIsListDialogOpen}
			onSelect={(item) => {
				if (item?.mint) {
					router.replace(`/token/${item.mint}`, undefined, { shallow: true, scroll: false });
				}
			}}
		/>
	</div>;
}
