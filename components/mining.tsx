import MyAvatar from "@/components/avatar";
import { Image } from "@heroui/react";
import { BottomTokenIcon } from "./icons";
import MiningTrade from "./miningTrade";
import MiningRewards from "./miningRewards";
import MiningAbout from "./miningAbout";
import { MiningList } from "./miningList";

export default function Mining() {

	// return <div className="flex flex-col items-center pt-[200px]">
	// 	<Image src="/images/mining.png" alt="Mining" disableAnimation disableSkeleton className="w-[80px] h-[80px]" />
	// 	<div className="text-[14px] text-[#868789]">挖矿待激活</div>
	// </div>

	return <div className="w-full max-w-[600px]">
		<div className="mt-[20px] flex items-center rounded-[12px] p-[12px] spin-border">
			<MyAvatar src={"/images/test.png"} alt="icon" className="w-[48px] h-[48px] bg-[transparent]" />
			<div className='h-[48px] flex flex-col justify-between ml-[8px]'>
				<div className='text-[17px] text-[#fff] font-semibold'>launchcoin</div>
				<div className='text-[13px] text-[#8D8B90]'>Launchcoin</div>
			</div>
			<div className='h-[48px] flex flex-col justify-between items-end ml-auto'>
				<div className="text-[17px] text-[#fff] font-semibold">$0.0743</div>
				<div className="text-[13px] text-[#4A4B4E]">24H<span className="ml-[2px] text-[#17C964]">14.39%</span></div>
				{/* text-[#FF5160] */}
			</div>
			<BottomTokenIcon className="cursor-pointer ml-[12px]" />
		</div>
		<div className="my-[12px]"><MiningAbout /></div>
		<div><MiningTrade /></div>
		<div className="mt-[24px]"><MiningRewards /></div>
		<div><MiningList /></div>
	</div>;
}
