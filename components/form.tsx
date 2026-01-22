import { Button, Form, Input, Textarea } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { AddIcon } from "./icons";
import pinFileToIPFS from "@/utils/pinata";
import TokenFactoryAbi from "@/constant/TokenFactory.json";
import { CHAINS_CONFIG, DEFAULT_CHAIN_ID } from "@/config/chains";
import { useChainId, usePublicClient, useWriteContract } from "wagmi";
import { getLuckyToken } from "@/service/api";
import { decodeEventLog } from "viem";
import BigNumber from "bignumber.js";
import { showErrorToast, showLoadingToast } from "@/utils/toastHelpers";

const MAX_AVATAR_MB = 5;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

type CreateFormProps = {
	onCreateSuccess?: (payload: {
		name: string;
		symbol: string;
		avatar: string;
		address?: string;
		hash?: `0x${string}`;
	}) => void;
};

export default function CreateForm({ onCreateSuccess }: CreateFormProps) {

	const [nameVal, setNameVal] = useState("");
	const [tickerVal, setTickerVal] = useState("");
	const [descriptionVal, setDescriptionVal] = useState("");
	const [amountVal, setAmountVal] = useState("");
	const [websiteVal, setWebsiteVal] = useState("");
	const [xVal, setXVal] = useState("");
	const [telegramVal, setTelegramVal] = useState("");
	const [showSocial, setShowSocial] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string>("");
	const [avatarError, setAvatarError] = useState<string | null>(null);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [ipfsHash, setIpfsHash] = useState<string | null>(null);
	const [createLoading, setCreateLoading] = useState(false);

	const chainId = useChainId();
	const { writeContractAsync, isPending: isCreatePending } = useWriteContract();
	const publicClient = usePublicClient({ chainId: chainId ?? DEFAULT_CHAIN_ID });

	useEffect(() => {
		if (!avatarFile) {
			setAvatarPreview("");
			return;
		}
		const url = URL.createObjectURL(avatarFile);
		setAvatarPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [avatarFile]);

	const errors = useMemo(() => {
		const nextErrors: Record<string, string> = {};
		if (!avatarFile) nextErrors.avatar = "请上传头像";
		if (avatarError) nextErrors.avatar = avatarError;
		if (!nameVal.trim()) nextErrors.name = "请输入代币名称";
		if (!tickerVal.trim()) nextErrors.ticker = "输入代币符号";
		if (amountVal && !/^\d*\.?\d{0,6}$/.test(amountVal)) nextErrors.amount = "请输入正确的数量";
		if (websiteVal && !/^https?:\/\/\S+$/i.test(websiteVal)) nextErrors.website = "请输入有效的网站链接";
		if (xVal && !/^(@|https?:\/\/)\S+$/i.test(xVal)) nextErrors.x = "请输入有效的 X 链接或用户名";
		if (telegramVal && !/^(@|https?:\/\/)\S+$/i.test(telegramVal)) nextErrors.telegram = "请输入有效的 Telegram 链接或用户名";
		return nextErrors;
	}, [nameVal, tickerVal, amountVal, websiteVal, xVal, telegramVal, avatarFile, avatarError]);

	const isValid = Object.keys(errors).length === 0;
	const avatarValid = !!avatarFile && !errors.avatar;

	const parseAmountWei = (value: string) => {
		if (!value) return 0n;
		const bn = new BigNumber(value);
		if (!bn.isFinite() || bn.lte(0)) return 0n;
		const scaled = bn.multipliedBy(new BigNumber(10).pow(18)).integerValue(BigNumber.ROUND_DOWN);
		return BigInt(scaled.toFixed(0));
	};

	const uploadFile = async () => {
		try {
			const params = {
				name: nameVal,
				symbol: tickerVal,
				image: ipfsHash,
				description: descriptionVal,
				website: websiteVal,
				x: xVal,
				telegram: telegramVal,
			};
			const res = await pinFileToIPFS(params, "json");
			if (!res) {
				showErrorToast("上传失败");
				return false;
			}
			return res;
		} catch (error) {
			showErrorToast("上传失败");
			return false;
		}
	};

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitted(true);
		if (!isValid) return;
		setCreateLoading(true);
		try {
			showLoadingToast("创建中", "请在钱包内确认交易");
			const uploadResult = await uploadFile();
			if (!uploadResult) {
				return;
			}

			const activeChainId = chainId ?? DEFAULT_CHAIN_ID;
			const tokenFactoryAddress =
				CHAINS_CONFIG.CHAIN_CONFIG[activeChainId as keyof typeof CHAINS_CONFIG.CHAIN_CONFIG]?.tokenFactory;
			if (!tokenFactoryAddress) {
				console.error("TokenFactory address not configured for chain:", activeChainId);
				showErrorToast("创建失败");
				return;
			}
			let salt = "";
			try {
				const res = await getLuckyToken();
				salt = res?.data?.salt ?? "";
			} catch (error) {
				console.error("getLuckyToken error:", error);
				showErrorToast("创建失败");
				return;
			}
			if (!salt) {
				console.error("getLuckyToken missing salt");
				showErrorToast("创建失败");
				return;
			}
			const amountWei = parseAmountWei(amountVal);
			const hasPreBuy = amountWei > 0n;
			const hash = await writeContractAsync({
				address: tokenFactoryAddress as `0x${string}`,
				abi: TokenFactoryAbi,
				functionName: hasPreBuy ? "createTokenAndBuy" : "createToken",
				args: hasPreBuy
					? [nameVal.trim(), tickerVal.trim(), uploadResult, salt, amountWei]
					: [nameVal.trim(), tickerVal.trim(), uploadResult, salt],
				value: hasPreBuy ? amountWei : undefined,
				chainId: activeChainId,
			});
			let createdAddress: string | undefined;
			if (publicClient && hash) {
				const receipt = await publicClient.waitForTransactionReceipt({ hash });
				if (receipt.status !== "success") {
					showErrorToast("创建失败");
					return;
				}
				for (const log of receipt.logs) {
					try {
						const decoded = decodeEventLog({
							abi: TokenFactoryAbi,
							data: log.data,
							topics: log.topics,
						});
						if (decoded.eventName === "CreateToken") {
							const token = (decoded.args as { token?: string }).token;
							if (token) {
								createdAddress = token;
								break;
							}
						}
					} catch {
						// ignore non-matching logs
					}
				}
			}
			onCreateSuccess?.({
				name: nameVal.trim(),
				symbol: tickerVal.trim(),
				avatar: ipfsHash || avatarPreview || "/images/default.png",
				address: createdAddress,
				hash,
			});
		} catch (error) {
			console.error("createToken error:", error);
			showErrorToast("创建失败");
		} finally {
			setCreateLoading(false);
		}
	}

	return (
		<div className="flex flex-col items-center w-full">
			<Form className="w-full px-[16px] pt-[8px] gap-[24px] min-h-[calc(100vh-56px-48px-52px)] md:min-h-[50vh]" onSubmit={onSubmit}>
				<div className="flex flex-col gap-[8px]">
					<div className="text-[14px] text-[#868789] font-bold">
						头像<span className="text-[#f31260] ml-[2px]">*</span>
					</div>
					<div className="flex items-center gap-[12px]">
						<label
							className={`relative w-[80px] h-[80px] rounded-full border-[1px] bg-[#191B1F] overflow-hidden flex items-center justify-center cursor-pointer ${submitted && errors.avatar ? "border-[#FF5160]" : "border-[#25262A]"
								}`}
						>
							<input
								type="file"
								accept={ACCEPTED_TYPES.join(",")}
								className="hidden"
								onChange={async (e) => {
									const file = e.target.files?.[0] ?? null;
									if (!file) return;

									if (!ACCEPTED_TYPES.includes(file.type)) {
										return;
									}
									const sizeMB = file.size / (1024 * 1024);
									if (sizeMB > MAX_AVATAR_MB) {
										return;
									}
									try {
										setUploadLoading(true);
										const res = await pinFileToIPFS(file);
										if (res) {
											setIpfsHash(res);
											setAvatarFile(file);
										} else {
											// toast.error(t("Toast.text1"));
											// avatarFieldRef.current?.clearFileInput();
										}
									} catch (error) {
										console.error("IPFS upload error:", error);
										// toast.error(t("Toast.text1"));
										// avatarFieldRef.current?.clearFileInput();
									} finally {
										setUploadLoading(false);
									}
								}}
							/>
							{avatarPreview ? (
								<img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
							) : (
								<AddIcon />
							)}
							{uploadLoading && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<div className="w-6 h-6 border-2 border-[#fd7438] border-t-transparent rounded-full animate-spin" />
								</div>
							)}
						</label>
					</div>
					{submitted && errors.avatar && (
						<div className="text-[12px] text-[#FF5160]">{errors.avatar}</div>
					)}
				</div>
				<Input
					classNames={{
						inputWrapper: "h-[44px] rounded-[8px] border-[#25262A] bg-[#191B1F] border-1",
						input: "text-[14px] text-white placeholder:text-[#4A4B4E]",
					}}
					isRequired
					errorMessage="请输入代币名称"
					label={<span className="text-[14px] text-[#868789]">名称</span>}
					labelPlacement="outside-top"
					name="name"
					placeholder="请输入代币名称"
					variant="bordered"
					value={nameVal}
					onChange={(e) => setNameVal(e.target.value)}
					maxLength={30}
					isInvalid={submitted && !!errors.name}
				/>
				<Input
					classNames={{
						inputWrapper: "h-[44px] rounded-[8px] border-[#25262A] bg-[#191B1F] border-1",
						input: "text-[14px] text-white placeholder:text-[#4A4B4E]",
					}}
					isRequired
					errorMessage="输入代币符号"
					label={<span className="text-[14px] text-[#868789]">Ticker</span>}
					labelPlacement="outside-top"
					name="ticker"
					placeholder="输入代币符号"
					variant="bordered"
					value={tickerVal}
					onChange={(e) => setTickerVal(e.target.value)}
					maxLength={30}
					isInvalid={submitted && !!errors.ticker}
				/>
				<Textarea
					classNames={{
						inputWrapper: "rounded-[8px] border-[#25262A] bg-[#191B1F] border-1",
						input: "text-[14px] text-white placeholder:text-[#4A4B4E]",
						label: "pb-[8px]",
					}}
					label={
						<div className="flex items-center text-[14px]">
							<span className="text-[#868789]">描述</span>
							<span className="text-[#4A4B4E]">（可选）</span>
						</div>
					}
					labelPlacement="outside"
					placeholder="输入代币描述"
					variant="bordered"
					name="description"
					value={descriptionVal}
					onChange={(e) => setDescriptionVal(e.target.value)}
					maxLength={200}
				/>
				<Input
					classNames={{
						inputWrapper: "h-[44px] rounded-[8px] border-[#25262A] bg-[#191B1F] border-1",
						input: "text-[14px] text-white placeholder:text-[#4A4B4E]",
					}}
					errorMessage="输入代币符号"
					label={
						<div className="flex items-center text-[14px]">
							<span className="text-[#868789]">提前买入</span>
							<span className="text-[#4A4B4E]">（可选）</span>
						</div>
					}
					labelPlacement="outside-top"
					name="amount"
					placeholder="0.00"
					variant="bordered"
					value={amountVal}
					onChange={(e) => {
						const value = e.target.value;
						if (value === "" || /^\d*\.?\d{0,6}$/.test(value)) {
							setAmountVal(value);
						}
					}}
					maxLength={20}
					isInvalid={submitted && !!errors.amount}
				/>
				{showSocial && (
					<>
						<Input
							classNames={{
								inputWrapper: "h-[44px] rounded-[8px] border-[#25262A] bg-[#191B1F] border-1",
								input: "text-[14px] text-white placeholder:text-[#4A4B4E]",
							}}
							label={
								<div className="flex items-center text-[14px]">
									<span className="text-[#868789]">网站</span>
									<span className="text-[#4A4B4E]">（可选）</span>
								</div>
							}
							labelPlacement="outside-top"
							name="website"
							placeholder="https://"
							variant="bordered"
							value={websiteVal}
							onChange={(e) => setWebsiteVal(e.target.value.trim())}
							maxLength={200}
							isInvalid={submitted && !!errors.website}
							errorMessage={errors.website}
						/>
						<Input
							classNames={{
								inputWrapper: "h-[44px] rounded-[8px] border-[#25262A] bg-[#191B1F] border-1",
								input: "text-[14px] text-white placeholder:text-[#4A4B4E]",
							}}
							label={
								<div className="flex items-center text-[14px]">
									<span className="text-[#868789]">X</span>
									<span className="text-[#4A4B4E]">（可选）</span>
								</div>
							}
							labelPlacement="outside-top"
							name="x"
							placeholder="https://"
							variant="bordered"
							value={xVal}
							onChange={(e) => setXVal(e.target.value.trim())}
							maxLength={200}
							isInvalid={submitted && !!errors.x}
							errorMessage={errors.x}
						/>
						<Input
							classNames={{
								inputWrapper: "h-[44px] rounded-[8px] border-[#25262A] bg-[#191B1F] border-1",
								input: "text-[14px] text-white placeholder:text-[#4A4B4E]",
							}}
							label={
								<div className="flex items-center text-[14px]">
									<span className="text-[#868789]">Telegram</span>
									<span className="text-[#4A4B4E]">（可选）</span>
								</div>
							}
							labelPlacement="outside-top"
							name="telegram"
							placeholder="https://"
							variant="bordered"
							value={telegramVal}
							onChange={(e) => setTelegramVal(e.target.value.trim())}
							maxLength={200}
							isInvalid={submitted && !!errors.telegram}
							errorMessage={errors.telegram}
						/>
					</>
				)}
				<button
					type="button"
					onClick={() => setShowSocial((prev) => !prev)}
					className="w-[120px] h-[36px] border-[1px] border-[#303135] rounded-full text-[12px] text-[#868789] flex items-center justify-center cursor-pointer mx-auto"
				>
					{showSocial ? "收起社交链接" : "添加社交链接"}
				</button>
				<div className="flex-1"></div>
				<Button
					type="submit"
					isDisabled={!isValid || isCreatePending || createLoading}
					isLoading={isCreatePending || createLoading}
					className={`w-full mt-[12px] rounded-[8px] h-[48px] text-[15px] disabled:opacity-60 ${avatarValid ? "bg-[#FD7438] text-[#fff]" : "bg-[#36383B] text-[#868789]"
						}`}
				>
					提交
				</Button>
			</Form>
		</div>
	);
}
