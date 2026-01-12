import MyAvatar from "@/components/avatar";
import { useState } from "react";
import { Input, Button } from "@heroui/react";
import { BNBIcon, SettingIcon } from "./icons";

export default function MiningTrade() {
	const numList = [0.1, 0.2, 0.5]
	const [side, setSide] = useState<"buy" | "sell">("buy");
	const [amount, setAmount] = useState("");

	return <div className="rounded-[8px] p-[12px] bg-[#191B1F] border-[1px] border-[#25262A]">
		<div className="flex h-[36px] bg-[#25262A] rounded-[8px]">
			<button
				type="button"
				onClick={() => setSide("buy")}
				className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${side === "buy"
					? "bg-[rgba(253,116,56,0.15)] border-[#FD7438] text-[#FD7438]"
					: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
					}`}
			>
				挖矿
			</button>
			<button
				type="button"
				onClick={() => setSide("sell")}
				className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${side === "sell"
					? "bg-[rgba(255,81,96,0.15)] border-[#FF5160] text-[#FF5160]"
					: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
					}`}
			>
				卖出
			</button>
		</div>
		<div>
			<Input
				classNames={{
					inputWrapper: "mt-[24px] h-[48px] !border-[#303135] bg-[rgba(13,15,19,0.35)] !border-[1.5px] rounded-[8px] hover:!border-[#303135] focus-within:!border-[#303135]",
					input: "text-[20px] text-[#FFF] font-semibold placeholder:text-[#868789] uppercase tracking-[-0.07px] text-right",
				}}
				name="amount"
				placeholder="0"
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
				startContent={<div className="shrink-0 flex items-center gap-[8px] pl-[2px]">
					{side === 'buy' ? <BNBIcon /> : <MyAvatar src={"/images/test.png"} alt="icon" className="w-[24px] h-[24px] bg-[transparent]" />}
					<div className="text-[16px] text-[#fff]">BNB</div>
				</div>}
			/>
		</div>
		<div className="h-[48px] flex items-center justify-between">
			<div className="text-[13px] text-[#868789]">钱包余额
				<span className="text-[#fff] mx-[4px]">3.26542 BNB</span>
				{side === 'buy' && <span className="text-[#17C964] cursor-pointer">充值</span>}
			</div>
			<div className="flex items-center gap-[4px] text-[12px] text-[#868789]">
				滑点<span className="text-[#fff]">1%</span><SettingIcon className="cursor-pointer" />
			</div>
		</div>
		<div className="h-[48px] border-[1px] border-dashed border-[#303135] rounded-[8px] flex items-center justify-between px-[12px]">
			<div className="text-[13px] text-[#868789]">预计获得</div>
			<div className="flex items-center gap-[4px]">
				{side === 'sell' ? <BNBIcon className="w-[16px] h-[16px]" /> : <MyAvatar src={"/images/test.png"} alt="icon" className="w-[16px] h-[16px] bg-[transparent]" />}
				<span className="text-[13px] text-[#fff]">54,0000</span>
			</div>
		</div>
		{
			side === 'buy' ? <Button fullWidth className="h-[44px] rounded-[12px] bg-[#FD7438] text-[15px] mt-[24px]">挖矿</Button>
				: <Button fullWidth className="h-[44px] rounded-[12px] bg-[#FF5160] text-[15px] mt-[24px]">卖出</Button>
		}
	</div>;
}