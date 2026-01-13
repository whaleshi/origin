import { Button, Form, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { CloseIcon, SearchInputIcon } from "./icons";
import MyAvatar from "@/components/avatar";
import MiningAbout from "./miningAbout";
import MiningRewards from "./miningRewards";
import { MiningList } from "./miningList";
import { useState } from "react";
import TokenItem from "./tokenItem";

type listDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function ListDialog({ isOpen, onOpenChange }: listDialogProps) {

	const [inputValue, setInputValue] = useState("");

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			size="lg"
			hideCloseButton
			placement="bottom-center"
			classNames={{
				backdrop: "bg-black/80",
				base: "bg-[#191B1F] border-[1px] border-[#303135] rounded-[0px] rounded-t-[12px] md:rounded-[12px] mx-0 md:mx-4 mb-0 md:my-auto",
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
					<div className="flex text-[17px]">
						选择矿池
					</div>
					<button className="absolute right-[16px] top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity cursor-pointer" onClick={() => onOpenChange(false)}>
						<CloseIcon />
					</button>
				</ModalHeader>
				<ModalBody className="w-full pb-[20px] pt-[8px] gap-0 items-center flex flex-col">
					<div className="w-full px-[14px]">
						<Input
							classNames={{
								inputWrapper: "h-[40px] rounded-[8px] border-[#25262A] bg-[#0D0F13] border-1",
								input: "text-[14px] text-white placeholder:text-[#4A4B4E]",
							}}
							name="name"
							placeholder="搜索或选择你想要挖矿的矿池"
							variant="bordered"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							endContent={<div className="">{inputValue && <CloseIcon className="w-[16px] h-[16px]" onClick={() => setInputValue("")} />}</div>}
							startContent={<SearchInputIcon className="cursor-pointer" />}
						/>
					</div>
					<div className="text-[16px] w-full mt-[24px] px-[14px] mb-[10px]">热门矿池</div>
					<div className='w-full max-h-[50vh] overflow-y-auto'>
						{
							Array.from({ length: 19 }).map((_, index) => (
								<div key={index} className='mt-[8px] px-[14px]'>
									<TokenItem type={index % 3 + 1} bg='#25262A' />
								</div>
							))
						}
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
