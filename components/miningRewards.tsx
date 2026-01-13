import MyAvatar from "@/components/avatar";
import { Button } from "@heroui/react";

export default function MiningRewards() {
	return <div className="w-full">
		<div className="text-[18px] text-[#fff] font-semibold">挖矿奖励</div>
		<div className="mt-[12px] border-[#25262A] border-[1px] border-dashed p-[12px] rounded-[8px]">
			<div className="flex items-center justify-between text-[13px] text-[#868789]">
				未精炼 DODO
				<div className="text-[#fff] flex items-center gap-[4px]">
					<MyAvatar src={"/images/test.png"} alt="icon" className="w-[16px] h-[16px] bg-[transparent] grayscale" />
					1,560,253
				</div>
			</div>
			<div className="flex items-center justify-between text-[13px] text-[#868789] mt-[12px]">
				精炼 DODO
				<div className="text-[#fff] flex items-center gap-[4px]">
					<MyAvatar src={"/images/test.png"} alt="icon" className="w-[16px] h-[16px] bg-[transparent]" />
					0.029411
				</div>
			</div>
			<Button radius="full" fullWidth className="h-[44px] mt-[16px] bg-[transparent] text-[15px] text-[#FD7438] border-[1px] border-[#FD7438]">领取</Button>
		</div>
	</div>;
}
