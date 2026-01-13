import MyAvatar from "@/components/avatar";
import { useState } from "react";
import { Input, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { BNBIcon, CloseIcon, CopyIcon, TgIcon, WebIcon, XIcon } from "./icons";
import MarketTrade from "./marketTrade";

export default function Market() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [side, setSide] = useState<"buy" | "sell">("buy");

	return (
		<div className="max-w-[600px] w-full">
			<div className="mt-[24px] flex items-center">
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
			</div>
			<div className="border-[1px] border-dashed border-[#25262A] rounded-[10px] my-[24px]">
				<div className="h-[40px] flex w-full">
					<div className="text-[14px] text-[#868789] px-[12px] flex-1 flex items-center justify-between border-r-[1px] border-dashed border-[#25262A]">市值<span className="text-[#fff]">$24.36M</span></div>
					<div className="text-[14px] text-[#868789] px-[12px] flex-1 flex items-center justify-between">FDV<span className="text-[#fff]">$24.36M</span></div>
				</div>
				<div className="p-[12px] border-t-[1px] border-dashed border-[#25262A] overflow-hidden relative">
					<div className="absolute inset-0 w-full h-full rounded-br-[10px] overflow-hidden">
						<div className="w-[68.32%] h-full border-r-[1px] border-[#17C964]" style={{ background: "linear-gradient(90deg, rgba(23, 201, 100, 0.00) 0%, rgba(23, 201, 100, 0.30) 100%)" }}></div>
					</div>
					<div className="text-[12px] text-[#868789]">Bonding Curve 进度</div>
					<div className="text-[#fff] text-[16px] font-semibold">68.32%</div>
				</div>
			</div>
			<div className="hidden md:block"><MarketTrade /></div>
			<div className="text-[15px] font-semibold mt-[24px]">代币详情</div>
			<div className="text-[13px] text-[#868789] mt-[12px]">DODO is a highly functional open source project that banks on blockchain ，the ecosystem is set to become the leading platform for launching coins.</div>
			<div className="flex items-center gap-[8px] mt-[12px]">
				<XIcon className="cursor-pointer" />
				<TgIcon className="cursor-pointer" />
				<WebIcon className="cursor-pointer" />
			</div>
			<div className="bg-[#191B1F] p-[12px] border-[1px] border-[#25262A] rounded-[8px] mt-[24px] text-[13px] text-[#868789] flex flex-col gap-[8px] mb-[30px]">
				<div className="flex items-center justify-between">代币总量<span className="text-[#fff]">10 亿枚</span></div>
				<div className="flex items-center justify-between">联合曲线总量<span className="text-[#fff]">8000 万枚</span></div>
				<div className="flex items-center justify-between">Pancake 流动性<span className="text-[#fff]">2000 万枚</span></div>
				<div className="border-y-[1px] border-[#303135] border-dashed flex flex-col gap-[8px] py-[8px]">
					<div className="flex items-center justify-between">代币挖矿预留<span className="text-[#fff]">9 亿枚</span></div>
					<div className="flex items-center justify-between">挖矿状态<span className="text-[#FD7438]">待激活</span></div>
				</div>
				<div className="flex items-center justify-between">合约地址<div className="text-[#fff] underline flex items-center gap-[4px]">0x1234...1234<CopyIcon className="cursor-pointer" /></div></div>
				<div className="flex items-center justify-between">创建者<div className="text-[#fff] underline flex items-center gap-[4px]">0x1234...1234<CopyIcon className="cursor-pointer" /></div></div>
			</div>
			<div className="h-[60px] bg-[#0D0F13] border-t-[1px] border-[#25262A] w-full fixed bottom-0 left-0 right-0 px-[16px] flex items-center gap-[8px] md:hidden">
				<Button fullWidth className="h-[44px] bg-[#FF5160] rounded-[8px] text-[15px]" onPress={onOpen}>卖出</Button>
				<Button fullWidth className="h-[44px] bg-[#17C964] rounded-[8px] text-[15px]" onPress={onOpen}>买入</Button>
			</div>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="md"
				hideCloseButton
				placement="bottom-center"
				classNames={{
					backdrop: "bg-black/80",
					base: "bg-[#191B1F] border-none rounded-[0px] rounded-t-[12px] mx-0 md:mx-4 mb-0 md:my-auto",
					wrapper: "items-end md:items-center",
					header: "border-none pb-0",
					body: "p-0"
				}}
			>
				<ModalContent className="relative overflow-visible">
					<div
						className="absolute left-1/2 -translate-x-1/2 -translate-y-[calc(100%-10px)] top-0 z-10"
						style={{ width: `${(343 / 375) * 100}%`, aspectRatio: '343/124' }}
					>
					</div>
					<ModalHeader className="flex justify-center items-center p-0 relative h-[48px] mt-[8px]">
						<div className="flex h-[36px] bg-[#25262A] rounded-[8px] w-[180px]">
							<button
								type="button"
								onClick={() => setSide("buy")}
								className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${side === "buy"
									? "bg-[rgba(23,201,100,0.15)] border-[#17C964] text-[#E9FFEF]"
									: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
									}`}
							>
								买入
							</button>
							<button
								type="button"
								onClick={() => setSide("sell")}
								className={`flex-1 rounded-[6px] text-[13px] border-[1px] font-semibold flex items-center justify-center cursor-pointer transition-colors ${side === "sell"
									? "bg-[rgba(255,81,96,0.15)] border-[#FF5160] text-[#FFE9EB]"
									: "text-[#868789] border-[#25262A] hover:text-[#fff] hover:bg-[#1E2025]"
									}`}
							>
								卖出
							</button>
						</div>
						<button className="absolute right-[16px] top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity cursor-pointer" onClick={onOpenChange}>
							<CloseIcon />
						</button>
					</ModalHeader>
					<ModalBody className="px-[14px] pb-[20px]">
						<MarketTrade />
					</ModalBody>
				</ModalContent>
			</Modal>
		</div>
	);
}
