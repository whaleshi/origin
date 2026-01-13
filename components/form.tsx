import { Button, Form, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { AddIcon, CloseIcon, CopyIcon } from "./icons";
import MyAvatar from "@/components/avatar";

const MAX_AVATAR_MB = 5;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export default function CreateForm() {

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

	const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		onOpen()
		e.preventDefault();
		setSubmitted(true);
		if (!isValid) return;
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
							className={`w-[80px] h-[80px] rounded-full border-[1px] bg-[#191B1F] overflow-hidden flex items-center justify-center cursor-pointer ${submitted && errors.avatar ? "border-[#FF5160]" : "border-[#25262A]"
								}`}
						>
							<input
								type="file"
								accept={ACCEPTED_TYPES.join(",")}
								className="hidden"
								onChange={(e) => {
									const file = e.target.files?.[0] ?? null;
									if (!file) {
										setAvatarFile(null);
										setAvatarError("请上传头像");
										return;
									}
									if (!ACCEPTED_TYPES.includes(file.type)) {
										setAvatarFile(null);
										setAvatarError("仅支持 png/jpg/webp/gif");
										return;
									}
									const sizeMB = file.size / (1024 * 1024);
									if (sizeMB > MAX_AVATAR_MB) {
										setAvatarFile(null);
										setAvatarError(`头像大小需小于 ${MAX_AVATAR_MB}MB`);
										return;
									}
									setAvatarError(null);
									setAvatarFile(file);
								}}
							/>
							{avatarPreview ? (
								<img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
							) : (
								<AddIcon />
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
					maxLength={20}
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
					onChange={(e) => setTickerVal(e.target.value.toUpperCase().replace(/\s+/g, ""))}
					maxLength={10}
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
							placeholder="@username 或 https://x.com/username"
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
							placeholder="@group 或 https://t.me/group"
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
					isDisabled={!isValid}
					className={`w-full mt-[12px] rounded-[8px] h-[48px] text-[15px] disabled:opacity-60 ${avatarValid ? "bg-[#FD7438] text-[#fff]" : "bg-[#36383B] text-[#868789]"
						}`}
				>
					提交
				</Button>
			</Form>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
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
							创建成功
						</div>
						<button className="absolute right-[16px] top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity cursor-pointer" onClick={onOpenChange}>
							<CloseIcon />
						</button>
					</ModalHeader>
					<ModalBody className="px-[14px] pb-[20px] gap-0 items-center">
						<MyAvatar src={"/images/test.png"} alt="icon" className="w-[80px] h-[80px] bg-[transparent]" />
						<div className="text-[17px] text-[#fff] font-bold">boz</div>
						<div className="text-[13px] text-[#67646B]">FuzzCoin</div>
						<div className="h-[28px] bg-[#25262A] rounded-full text-[11px] text-[#868789] flex items-center px-[12px] gap-[4px]">0x1234...5678<CopyIcon /></div>
						<Button fullWidth className="mt-[24px] h-[44px] bg-[#25262A] rounded-[8px] text-[15px] text-[#fff]">查看详情</Button>
						<Button fullWidth className="mt-[12px] h-[44px] bg-[#FD7438] rounded-[8px] text-[15px] text-[#fff]">分享到 X</Button>
					</ModalBody>
				</ModalContent>
			</Modal>
		</div>
	);
}
