import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input } from "@heroui/react";
import { RuleCloseIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSlippageStore } from "@/stores/slippage";

interface SlippageModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SlippageModal = ({ isOpen, onClose }: SlippageModalProps) => {
	const { t } = useTranslation();
	const { slippage, setSlippage } = useSlippageStore();
	const [selectedSlippage, setSelectedSlippage] = useState(slippage);
	const [customSlippage, setCustomSlippage] = useState("");

	const slippageOptions = [
		{ label: "1%", value: 1 },
		{ label: "3%", value: 3 },
		{ label: "5%", value: 5 },
	];

	const handleSlippageSelect = (value: number) => {
		setSelectedSlippage(value);
		setCustomSlippage("");
	};

	const handleCustomSlippageChange = (value: string) => {
		const regex = /^\d*\.?\d*$/;
		if (regex.test(value)) {
			setCustomSlippage(value);
			const numValue = parseFloat(value);
			if (!isNaN(numValue) && numValue > 0) {
				setSelectedSlippage(numValue);
			}
		}
	};

	const handleComplete = () => {
		setSlippage(selectedSlippage);
		onClose();
	};
	useEffect(() => {
		if (!isOpen) return;
		setSelectedSlippage(slippage);
		setCustomSlippage("");
	}, [isOpen, slippage]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md"
			hideCloseButton
			placement="bottom-center"
			classNames={{
				backdrop: "bg-black/80",
				base: "bg-[#191B1F] border-none rounded-t-[20px] lg:rounded-[20px] mx-0 lg:mx-4 mb-0 lg:my-auto",
				wrapper: "items-end lg:items-center",
				header: "border-none pb-0",
				body: "p-0",
			}}
		>
			<ModalContent>
				<ModalHeader className="flex justify-center items-center p-0 relative h-[64px]">
					<h2 className="text-[18px] lg:text-[20px] font-semibold text-white">{t("Game.slippageSettings")}</h2>
					<button
						onClick={onClose}
						className="absolute right-[16px] top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity cursor-pointer"
					>
						<RuleCloseIcon className="w-6 h-6" />
					</button>
				</ModalHeader>
				<ModalBody className="px-[16px] pb-[20px] gap-[0px]">
					<div className="text-[14px] text-[#868789] mb-[16px]">
						{t("Game.slippageDescription")}
					</div>
					<div className="grid grid-cols-3 gap-[12px] mb-[12px]">
						{slippageOptions.map((option) => (
							<Button
								key={option.value}
								onPress={() => handleSlippageSelect(option.value)}
								radius="lg"
								className={`h-[50px] text-[16px] font-medium transition-all ${selectedSlippage === option.value && !customSlippage
									? "bg-[#191B1F] text-white border-2 border-white"
									: "bg-[#191B1F] text-[#868789] border-2 border-[#25262A]"
									}`}
							>
								{option.label}
							</Button>
						))}
					</div>
					<div className="w-full mb-[24px]">
						<Input
							classNames={{
								inputWrapper: `h-[50px] bg-[#191B1F] rounded-[12px] border-2 ${customSlippage ? "border-white" : "border-[#25262A]"
									} hover:!border-white focus-within:!border-white`,
								input: "text-[16px] text-white placeholder:text-[#868789] text-center",
							}}
							placeholder={t("Game.custom")}
							variant="bordered"
							value={customSlippage}
							onChange={(e) => handleCustomSlippageChange(e.target.value)}
						/>
					</div>
					<Button
						onPress={handleComplete}
						radius="full"
						className="w-full h-[50px] bg-white hover:bg-gray-100 text-black font-semibold text-[16px]"
					>
						{t("Game.complete")}
					</Button>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
