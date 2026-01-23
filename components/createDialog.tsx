import { Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { CloseIcon, CopyIcon } from "./icons";
import CreateForm from "./form";
import { useMemo, useState } from "react";
import MyAvatar from "@/components/avatar";
import useClipboard from "@/hooks/useCopyToClipboard";
import router from "next/router";
import { useTranslation } from "react-i18next";


type CreateDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
};
const CreateDialog: React.FC<CreateDialogProps> = ({ isOpen, onOpenChange }) => {
	const { t } = useTranslation();
	const [createdToken, setCreatedToken] = useState<{
		name: string;
		symbol: string;
		avatar: string;
		address?: string;
		hash?: `0x${string}`;
	} | null>(null);
	const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onOpenChange: onSuccessOpenChange } = useDisclosure();
	const { copy: copyToClipboard } = useClipboard();

	const formattedAddress = useMemo(() => {
		if (!createdToken?.address) return "--";
		return `${createdToken.address.slice(0, 6)}...${createdToken.address.slice(-4)}`;
	}, [createdToken?.address]);

	const handleCopy = async () => {
		if (!createdToken?.address) return;
		await copyToClipboard(createdToken.address);
	};

	const handleShare = () => {
		if (!createdToken) return;
		const origin = typeof window !== "undefined" ? window.location.origin : "";
		const shareUrl = createdToken.address ? `${origin}/token/${createdToken.address}` : origin;
		const text = t("Create.shareText", { name: createdToken.name, symbol: createdToken.symbol });
		const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const handleViewDetail = () => {
		if (!createdToken?.address) return;
		onSuccessOpenChange();
		onOpenChange(false);
		router.push(`/token/${createdToken.address}`);
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				isDismissable={false}
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
							{t("Create.title")}
						</div>
						<button
							className="absolute right-[16px] top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity cursor-pointer"
							onClick={() => onOpenChange(false)}
						>
							<CloseIcon />
						</button>
					</ModalHeader>
					<ModalBody className="pb-[20px] max-h-[65vh] overflow-y-auto">
						<CreateForm
							onCreateSuccess={(payload) => {
								setCreatedToken(payload);
								onSuccessOpen();
								onOpenChange(false);
							}}
						/>
					</ModalBody>
				</ModalContent>
			</Modal>

			<Modal
				isOpen={isSuccessOpen}
				onOpenChange={onSuccessOpenChange}
				size="md"
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
							{t("Create.success")}
						</div>
						<button className="absolute right-[16px] top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity cursor-pointer" onClick={onSuccessOpenChange}>
							<CloseIcon />
						</button>
					</ModalHeader>
					<ModalBody className="px-[14px] pb-[20px] gap-0 items-center">
						<MyAvatar src={createdToken?.avatar || "/images/default.png"} alt="icon" className="w-[80px] h-[80px] bg-[transparent]" />
						<div className="text-[17px] text-[#fff] font-bold mt-[12px] text-center">{createdToken?.name || "--"}</div>
						<div className="text-[13px] text-[#67646B] mt-[4px] mb-[8px]">{createdToken?.symbol || "--"}</div>
						<div className="h-[28px] bg-[#25262A] rounded-full text-[11px] text-[#868789] flex items-center px-[12px] gap-[4px]">
							{formattedAddress}
							<button
								type="button"
								className="hover:opacity-70 transition-opacity cursor-pointer"
								onClick={handleCopy}
								disabled={!createdToken?.address}
							>
								<CopyIcon />
							</button>
						</div>
						<Button
							fullWidth
							className="mt-[24px] h-[44px] bg-[#25262A] rounded-[8px] text-[15px] text-[#fff]"
							isDisabled={!createdToken?.address}
							onPress={handleViewDetail}
						>
							{t("Create.viewDetails")}
						</Button>
						<Button fullWidth className="mt-[12px] h-[44px] bg-[#FD7438] rounded-[8px] text-[15px] text-[#fff]" onPress={handleShare}>
							{t("Create.shareToX")}
						</Button>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default CreateDialog;
