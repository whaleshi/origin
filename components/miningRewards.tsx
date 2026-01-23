import MyAvatar from "@/components/avatar";
import { useState } from "react";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Popover,
	PopoverContent,
	PopoverTrigger,
	useDisclosure,
} from "@heroui/react";
import { useAuthStore } from "@/stores/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserAsset } from "@/service/api";
import { format8 } from "@/utils/number";
import BigNumber from "bignumber.js";
import { useTranslation } from "react-i18next";
import { CloseIcon, InfoIcon } from "./icons";
import { formatOriginAmountWithDecimals } from "@/utils/formatOriginAmount";
import { usePublicClient, useWriteContract } from "wagmi";
import { DEFAULT_CHAIN_CONFIG, DEFAULT_CHAIN_ID } from "@/config/chains";
import AssetManagerAbi from "@/constant/AssetManager.json";
import usePrivyLogin from "@/hooks/usePrivyLogin";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/utils/toastHelpers";
import { ethers } from "ethers";

const CLAIM_AMOUNT_WEI = ethers.parseUnits("100000", 10);

type MiningRewardsProps = {
	coinInfo?: any;
};

export default function MiningRewards({ coinInfo }: MiningRewardsProps) {
	const { t } = useTranslation();
	const { address } = useAuthStore();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [isClaiming, setIsClaiming] = useState(false);
	const { toLogin } = usePrivyLogin();
	const { writeContractAsync } = useWriteContract();
	const publicClient = usePublicClient({ chainId: DEFAULT_CHAIN_ID });
	const queryClient = useQueryClient();
	const mint = coinInfo?.mint;
	const { data: userAsset } = useQuery({
		queryKey: ["miningUserAsset", address, mint],
		queryFn: async () => {
			const result = await getUserAsset({
				user_addr: address,
				mint,
			});
			return result?.data;
		},
		enabled: !!address && !!mint,
		refetchInterval: 3000,
	});
	const tokenSymbol = coinInfo?.symbol ?? "--";
	const tokenAvatar = coinInfo?.image_url || "/images/default.png";
	const unrefinedAmount = userAsset?.amount ?? "0";
	const refinedAmount = userAsset?.native_amount ?? "0";
	const unrefinedDisplay = formatOriginAmountWithDecimals(unrefinedAmount);
	const refinedDisplay = formatOriginAmountWithDecimals(refinedAmount);
	const canClaim = (() => {
		const unrefined = new BigNumber(unrefinedAmount);
		const refined = new BigNumber(refinedAmount);
		if (!unrefined.isFinite() && !refined.isFinite()) return false;
		return unrefined.gt(0) || refined.gt(0);
	})();
	const handleConfirmClaim = async () => {
		if (!address) {
			toLogin();
			return;
		}
		const assetManagerAddress = DEFAULT_CHAIN_CONFIG?.assetManager as `0x${string}` | undefined;
		const extraInfo = coinInfo?.mint;
		if (!assetManagerAddress || !extraInfo) {
			showErrorToast(t("Toast.claimFailed"));
			return;
		}
		try {
			setIsClaiming(true);
			const orderId = Date.now().toString();
			console.log(orderId, "claim", extraInfo, ethers.ZeroAddress, 100000n)
			const hash = await writeContractAsync({
				address: assetManagerAddress,
				abi: (AssetManagerAbi as any).abi ?? AssetManagerAbi,
				functionName: "deposit",
				args: [orderId, "claim", extraInfo, ethers.ZeroAddress, CLAIM_AMOUNT_WEI],
				value: CLAIM_AMOUNT_WEI,
				chainId: DEFAULT_CHAIN_ID,
			});
			if (hash) {
				showLoadingToast(t("Toast.claimSubmitted"), `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
			}
			if (publicClient && hash) {
				await publicClient.waitForTransactionReceipt({ hash });
				showSuccessToast(t("Toast.claimSuccess"), `Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`);
				queryClient.invalidateQueries({ queryKey: ["miningUserAsset", address, mint] });
			}
		} catch (error) {
			console.error("deposit claim error:", error);
			showErrorToast(t("Toast.claimFailed"));
		} finally {
			setIsClaiming(false);
		}
	};

	return <div className="w-full">
		<div className="text-[18px] text-[#fff] font-semibold">{t("MiningRewards.title")}</div>
		<div className="mt-[12px] border-[#25262A] border-[1px] border-dashed p-[12px] rounded-[8px]">
			<div className="flex items-center justify-between text-[13px] text-[#868789] whitespace-nowrap">
				<div className="flex-1 truncate flex items-center max-w-[60%]">{t("Common.unrefined")}
					<span className="truncate ml-[4px]">{tokenSymbol}</span>
					<Popover placement="top" showArrow={true}>
						<PopoverTrigger>
							<div><InfoIcon className="cursor-pointer w-[12px] h-[12px]" /></div>
						</PopoverTrigger>
						<PopoverContent>
							<div className="max-w-[270px] text-[12px] text-[#E6E6E6]">
								{t("MiningRewards.unrefinedDesc", { tokenSymbol })}
							</div>
						</PopoverContent>
					</Popover>
				</div>
				<div className="text-[#fff] flex items-center gap-[4px]">
					<MyAvatar src={tokenAvatar} alt="icon" className="w-[16px] h-[16px] bg-[transparent] grayscale" />
					{format8(unrefinedAmount)}
				</div>
			</div>
			<div className="flex items-center justify-between text-[13px] text-[#868789] mt-[12px] whitespace-nowrap">
				<div className="flex-1 truncate flex items-center max-w-[60%]">{t("Common.refined")}
					<span className="truncate ml-[4px]">{tokenSymbol}</span>
					<Popover placement="top" showArrow={true}>
						<PopoverTrigger>
							<div><InfoIcon className="cursor-pointer w-[12px] h-[12px]" /></div>
						</PopoverTrigger>
						<PopoverContent>
							<div className="max-w-[270px] text-[12px] text-[#E6E6E6]">
								{t("MiningRewards.refinedDesc", { tokenSymbol })}
							</div>
						</PopoverContent>
					</Popover>
				</div>
				<div className="text-[#fff] flex items-center gap-[4px]">
					<MyAvatar src={tokenAvatar} alt="icon" className="w-[16px] h-[16px] bg-[transparent]" />
					{format8(refinedAmount)}
				</div>
			</div>
			<Button
				radius="full"
				fullWidth
				isDisabled={!canClaim || isClaiming}
				isLoading={isClaiming}
				className="h-[44px] mt-[16px] bg-[transparent] text-[15px] text-[#FD7438] border-[1px] border-[#FD7438] disabled:opacity-60 disabled:text-[#868789] disabled:border-[#36383B]"
				onPress={onOpen}
			>
				{t("MiningRewards.claim")}
			</Button>
		</div>
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			classNames={{
				backdrop: "bg-black/80",
				base: "bg-[#191B1F] border-none rounded-[0px] rounded-t-[12px] md:rounded-[12px] md:mx-4 mb-0 md:my-auto",
				body: "p-4",
				header: "border-b-0 pb-0 p-0",
			}}
			backdrop="blur"
			size="md"
			hideCloseButton
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="relative flex justify-center items-center pt-[16px] pb-4">
							<h2 className="text-white text-[17px] font-semibold">{t("Game.claimRewards")}</h2>
							<button
								onClick={onClose}
								className="absolute right-[12px] top-[12px] p-2 hover:bg-[#25262A] rounded-lg transition-colors cursor-pointer"
							>
								<CloseIcon className="w-6 h-6" />
							</button>
						</ModalHeader>
						<ModalBody className="pt-0 gap-0">
							<p className="text-white text-[14px] mb-4">
								{t("MiningRewards.claimConfirmDesc", { tokenSymbol })}
							</p>
							<div className="space-y-[12px] border-[1px] border-dashed border-[#303135] p-[12px] rounded-[8px]">
								<div className="flex items-center justify-between mb-[8px]">
									<div className="flex items-center gap-[8px]">
										<span className="text-[13px] text-[#868789] truncate max-w-[140px] min-w-0">
											{t("Common.unrefined")} {tokenSymbol}
										</span>
										<Popover placement="top" showArrow={true}>
											<PopoverTrigger>
												<div><InfoIcon className="cursor-pointer w-[12px] h-[12px]" /></div>
											</PopoverTrigger>
											<PopoverContent>
												<div className="max-w-[270px] text-[12px] text-[#E6E6E6]">
													{t("MiningRewards.unrefinedDesc", { tokenSymbol })}
												</div>
											</PopoverContent>
										</Popover>
									</div>
									<div className="text-[13px] text-[#fff] flex items-center gap-[4px]">
										<MyAvatar src={tokenAvatar} alt="icon" className="w-[16px] h-[16px] bg-[transparent] grayscale" />
										{unrefinedDisplay}
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-[8px]">
										<span className="text-[13px] text-[#868789] truncate max-w-[140px] min-w-0">
											{t("Common.refined")} {tokenSymbol}
										</span>
										<Popover placement="top" showArrow={true}>
											<PopoverTrigger>
												<div><InfoIcon className="cursor-pointer w-[12px] h-[12px]" /></div>
											</PopoverTrigger>
											<PopoverContent>
												<div className="max-w-[270px] text-[12px] text-[#E6E6E6]">
													{t("MiningRewards.refinedDesc", { tokenSymbol })}
												</div>
											</PopoverContent>
										</Popover>
									</div>
									<div className="text-[13px] text-[#fff] flex items-center gap-[4px]">
										<MyAvatar src={tokenAvatar} alt="icon" className="w-[16px] h-[16px] bg-[transparent]" />
										{refinedDisplay}
									</div>
								</div>
							</div>
							<Button
								fullWidth
								className="h-[44px] text-[15px] text-[#0D0F13] bg-[#fff] rounded-[22px] mt-6"
								onPress={() => {
									handleConfirmClaim();
									onClose();
								}}
								isLoading={isClaiming}
							>
								{t("Game.confirm")}
							</Button>
						</ModalBody>
					</>
				)}
			</ModalContent>
		</Modal>
	</div>;
}
