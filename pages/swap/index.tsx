import { BNBIcon, CopyIcon, SelectDownIcon, SettingIcon, SwapIcon, ZuanIcon, ZuanRightIcon } from "@/components/icons";
import { Input, Button } from "@heroui/react";
import { useState } from "react";
import MyAvatar from "@/components/avatar";
import SwapAbout from "@/components/swapAbout";

export default function Swap() {

	const [amount, setAmount] = useState("");

	return <div className="flex flex-col items-center w-full px-[14px]">
		<div className="w-full max-w-[600px] flex items-center justify-between mt-[24px]">
			<div className="text-[28px] text-[#fff] font-bold">SWAP</div>
			<div className="w-[100px] h-[32px] rounded-r-[16px] flex items-center justify-center gap-[2px] cursor-pointer"
				style={{ background: "linear-gradient(90deg, rgba(239, 176, 0, 0.00) 0%, rgba(239, 176, 0, 0.25) 100%)" }}
			>
				<ZuanIcon />
				<div className="text-[14px] text-[#EFB000]">挖矿奖励</div>
				<ZuanRightIcon />
			</div>
		</div>
		<div className="w-full max-w-[600px] mt-[24px]">
			<Input
				classNames={{
					inputWrapper: "h-[60px] !border-[#191B1F] bg-[#191B1F] !border-[1.5px] rounded-[8px] hover:!border-[#191B1F] focus-within:!border-[#191B1F]",
					input: "text-[27px] text-[#FFF] font-semibold placeholder:text-[#4A4B4E] uppercase tracking-[-0.07px]",
				}}
				name="amount"
				placeholder="0.00"
				variant="bordered"
				value={amount}
				isDisabled={false}
				onChange={(e) => {
					const value = e.target.value;
					if (value === '' || /^\d*\.?\d{0,6}$/.test(value)) {
						const formattedValue = value.startsWith('.') ? '0' + value : value;
						setAmount(formattedValue);
					}
				}}
				endContent={<div className="shrink-0 flex items-center gap-[6px] h-[36px] border-[1px] border-[#303135] px-[8px] rounded-full">
					{/* <MyAvatar src={"/images/test.png"} alt="icon" className="w-[24px] h-[24px] bg-[transparent] border-[1px] border-[#36383B]" /> */}
					<BNBIcon className="w-[24px] h-[24px]" />
					<div className="text-[16px] text-[#fff]">BNB</div>
				</div>}
			/>
			<div className="h-[52px] flex items-center">
				<div className="text-[13px] text-[#868789] flex-1">钱包余额: <span className="text-[#fff]">12.89 BNB</span></div>
				<SwapIcon className="w-[36px] h-[36px] rotate-90" />
				<div className="flex items-center justify-end gap-[4px] text-[13px] text-[#868789] flex-1">
					滑点<span className="text-[#fff]">1%</span><SettingIcon className="cursor-pointer" />
				</div>
			</div>
			<Input
				classNames={{
					inputWrapper: "h-[60px] !border-[#191B1F] bg-[#191B1F] !border-[1.5px] rounded-[8px] hover:!border-[#191B1F] focus-within:!border-[#191B1F]",
					input: "text-[27px] text-[#FFF] font-semibold placeholder:text-[#4A4B4E] uppercase tracking-[-0.07px]",
				}}
				name="amount"
				placeholder="0.00"
				variant="bordered"
				value={amount}
				isDisabled={false}
				onChange={(e) => {
					const value = e.target.value;
					if (value === '' || /^\d*\.?\d{0,6}$/.test(value)) {
						const formattedValue = value.startsWith('.') ? '0' + value : value;
						setAmount(formattedValue);
					}
				}}
				endContent={<div className="shrink-0 flex items-center gap-[6px] h-[36px] border-[1px] border-[#303135] px-[8px] rounded-full cursor-pointer">
					{/* <MyAvatar src={"/images/test.png"} alt="icon" className="w-[24px] h-[24px] bg-[transparent] border-[1px] border-[#36383B]" /> */}
					{/* <BNBIcon className="w-[24px] h-[24px]" /> */}
					<div className="text-[16px] text-[#fff]">Select</div>
					<SelectDownIcon />
				</div>}
			/>
			<Button radius="full" fullWidth className="h-[48px] bg-[#36383B] text-[15px] text-[#868789] mt-[16px]">Swap</Button>
			<div className="mt-[32px] border-[1px] border-[#25262A] border-dashed rounded-[8px] overflow-hidden">
				<div className="h-[60px] flex">
					<div className="text-[16px] text-[#fff] border-r-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]">
						$24.36M<span className="text-[12px] text-[#868789]">市值</span>
					</div>
					<div className="text-[16px] text-[#fff] border-r-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]">
						$0.00032<span className="text-[12px] text-[#868789]">价格</span>
					</div>
				</div>
				<div className="h-[60px] flex border-t-[1px] border-[#25262A] border-dashed">
					<div className="text-[16px] text-[#17C964] border-r-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]">
						+8.89%<span className="text-[12px] text-[#868789]">24H 涨跌</span>
					</div>
					<div className="text-[16px] text-[#fff] border-r-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]">
						$1.38K<span className="text-[12px] text-[#868789]">流动性</span>
					</div>
				</div>
				<div className="h-[60px] text-[16px] text-[#fff] border-t-[1px] border-[#25262A] border-dashed flex flex-1 flex-col items-center justify-center gap-[2px]">
					<div className="flex items-center gap-[4px]">0X1234...1234 <CopyIcon className="cursor-pointer" /></div>
					<span className="text-[12px] text-[#868789]">市值</span>
				</div>
			</div>
			<div>
				<SwapAbout />
			</div>
		</div>
	</div>;
}