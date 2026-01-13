import MyAvatar from "@/components/avatar";

export default function MiningAbout() {
	return (
		<div className="w-full rounded-[8px] overflow-hidden border-[1px] border-[#25262A]">
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
	);
}
