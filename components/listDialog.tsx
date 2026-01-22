import { Input, Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { CloseIcon, SearchInputIcon } from "./icons";
import { useMemo, useState } from "react";
import TokenItem, { TokenItemSkeleton } from "./tokenItem";
import router from "next/router";
import { getCoinList } from '@/service/api';
import { useQuery } from "@tanstack/react-query";

type listDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect?: (item: any) => void;
};

export default function ListDialog({ isOpen, onOpenChange, onSelect }: listDialogProps) {

	const [inputValue, setInputValue] = useState("");
	const keyword = inputValue.trim();

	const { data, isLoading } = useQuery({
		queryKey: ["coinList", "mining", keyword],
		queryFn: async () => {
			const params = {
				page: 1,
				page_size: 50,
				sort_type: 4,
				filter_type: 2,
				keyword,
			};
			const result = await getCoinList(params);
			return result?.data;
		},
		enabled: isOpen,
	});
	const filteredList = useMemo(() => {
		const list = Array.isArray((data as { list?: unknown[] } | null | undefined)?.list)
			? (data as { list?: any[] }).list ?? []
			: (Array.isArray(data) ? data : []);
		return list;
	}, [data]);

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
							isLoading ? (
								<div className="mt-[8px] px-[14px] flex flex-col gap-[8px]">
									{Array.from({ length: 10 }).map((_, index) => (
										<TokenItemSkeleton key={index} />
									))}
								</div>
							) : (
								filteredList.length > 0 ? (
									filteredList.map((item, index) => (
										<div key={item?.id ?? item?.coin_id ?? item?.address ?? index} className='mt-[8px] px-[14px]'>
											<TokenItem
												bg='#25262A'
												data={item}
												onClick={(clicked) => {
													if (onSelect) {
														onSelect(clicked);
														onOpenChange(false);
													} else {
														router.push(`/token/${clicked?.mint}`);
													}
												}}
											/>
										</div>
									))
								) : (
									<div className="h-[200px] mt-[8px] flex flex-col items-center justify-center">
										<img src="/images/nothing.png" className="w-[80px] h-[80px]" />
										<div className="text-[#868789] text-[14px]">暂无数据</div>
									</div>
								)
							)
						}
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
