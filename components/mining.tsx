import MyAvatar from "@/components/avatar";
import { Image } from "@heroui/react";
import { BottomTokenIcon } from "./icons";
import MiningTrade from "./miningTrade";
import MiningRewards from "./miningRewards";

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
		<div className="rounded-[8px] overflow-hidden border-[1px] border-[#25262A] my-[12px]">
			<div className="h-[60px] bg-[#191B1F] flex">
				<div className="flex-1 border-r-[1px] border-[#25262A] flex flex-col items-center justify-center gap-[4px]">
					<div className="text-[16px] text-[#fff] flex items-center gap-[4px]">
						<MyAvatar src={"/images/test.png"} alt="icon" className="w-[18px] h-[18px] bg-[transparent] grayscale" />
						<span>36000</span>
						<span className="text-[#4A4B4E] text-[12px]">/</span>
						<MyAvatar src={"/images/test.png"} alt="icon" className="w-[18px] h-[18px] bg-[transparent] grayscale" />
						<span>6000</span>
					</div>
					<div className="text-[12px] text-[#4A4B4E]">母矿奖池 / 本轮发放</div>
				</div>
				<div className="flex-1 flex flex-col items-center justify-center gap-[4px]">
					<div className="text-[16px] text-[#fff]">05:59:59</div>
					<div className="text-[12px] text-[#4A4B4E]">#1</div>
				</div>
			</div>
			<div className="p-[12px] border-t-[1px] border-[#25262A] flex flex-col gap-[8px]">
				<div className="flex items-center justify-between text-[12px] text-[#868789]">
					我的交易量 / 全局交易量
					<div className="text-[#fff] flex items-center gap-[4px]">
						<MyAvatar src={"/images/test.png"} alt="icon" className="w-[12px] h-[12px] bg-[transparent] grayscale" />
						<span>36000</span>
						<span className="text-[#4A4B4E] text-[12px]">/</span>
						<MyAvatar src={"/images/test.png"} alt="icon" className="w-[12px] h-[12px] bg-[transparent] grayscale" />
						<span>6000</span>
					</div>
				</div>
				<div className="flex items-center justify-between text-[12px] text-[#868789]">
					我的占比
					<div className="text-[#fff]">5.00%</div>
				</div>
				<div className="flex items-center justify-between text-[12px] text-[#868789]">
					预计获得
					<div className="text-[#fff] flex items-center gap-[4px]">
						<MyAvatar src={"/images/test.png"} alt="icon" className="w-[12px] h-[12px] bg-[transparent] grayscale" />
						680.26
					</div>
				</div>
			</div>
		</div>
		<div><MiningTrade /></div>
		<div className="mt-[24px]"><MiningRewards /></div>
	</div>;
}
