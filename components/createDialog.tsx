import { Input, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { CloseIcon } from "./icons";
import CreateForm from "./form";


type CreateDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
};
const CreateDialog: React.FC<CreateDialogProps> = ({ isOpen, onOpenChange }) => {
	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			size="lg"
			hideCloseButton
			placement="bottom-center"
			classNames={{
				backdrop: "bg-black/80",
				base: "bg-[#0D0F13] border-[1px] border-[#25262A] rounded-[12px] mx-0 md:mx-4 mb-0 md:my-auto",
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
						创建代币
					</div>
					<button
						className="absolute right-[16px] top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity cursor-pointer"
						onClick={() => onOpenChange(false)}
					>
						<CloseIcon />
					</button>
				</ModalHeader>
				<ModalBody className="pb-[20px] max-h-[65vh] overflow-y-auto">
					<CreateForm />
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default CreateDialog;
