import { Button, Form, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { CloseIcon } from "./icons";
import MyAvatar from "@/components/avatar";
import MiningAbout from "./miningAbout";
import MiningRewards from "./miningRewards";
import { MiningList } from "./miningList";
type MiningDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	coinInfo?: any;
};

export default function MiningDialog({ isOpen, onOpenChange, coinInfo }: MiningDialogProps) {
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
						挖矿数据
					</div>
					<button className="absolute right-[16px] top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity cursor-pointer" onClick={() => onOpenChange(false)}>
						<CloseIcon />
					</button>
				</ModalHeader>
				<ModalBody className="w-full p-[14px] pb-[20px] gap-0 items-center max-h-[65vh] overflow-y-auto flex flex-col">
					<div className="w-full"><MiningAbout coinInfo={coinInfo} /></div>
					<div className="mt-[24px] w-full"><MiningRewards coinInfo={coinInfo} /></div>
					<MiningList coinInfo={coinInfo} />
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
