import { CloseIcon, SearchInputIcon } from "@/components/icons";
import TokenItem, { TokenItemSkeleton } from "@/components/tokenItem";
import { Input } from "@heroui/react";
import router from "next/router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCoinList } from "@/service/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function SearchPage() {
	const [inputValue, setInputValue] = useState("");
	const searchKeyword = inputValue.trim();
	const debouncedKeyword = useDebouncedValue(searchKeyword, 300);
	const { data: searchData, isFetching: isSearching } = useQuery({
		queryKey: ["searchPageTokens", debouncedKeyword],
		queryFn: async () => {
			const result = await getCoinList({ keyword: debouncedKeyword, page: 1, page_size: 100 });
			return result?.data;
		},
		enabled: !!debouncedKeyword,
	});
	const isSearchPending = !!searchKeyword && debouncedKeyword !== searchKeyword;
	const searchResults = useMemo(() => {
		if (Array.isArray((searchData as { list?: unknown[] } | null | undefined)?.list)) {
			return (searchData as { list?: any[] }).list ?? [];
		}
		if (Array.isArray(searchData)) return searchData;
		return [];
	}, [searchData]);
	return (
		<div className="">
			<div className="px-[16px] py-[8px] flex items-center gap-[16px]">
				<Input
					classNames={{
						inputWrapper: "h-[40px] rounded-[8px] border-[#25262A] bg-[#191B1F] border-1",
						input: "text-[14px] text-white placeholder:text-[#4A4B4E]",
					}}
					name="name"
					placeholder="请输入"
					variant="bordered"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					endContent={<div className="">{inputValue && <CloseIcon className="w-[16px] h-[16px]" onClick={() => setInputValue("")} />}</div>}
					startContent={<SearchInputIcon />}
				/>
				<div className="text-[14px] whitespace-nowrap" onClick={() => router.push("/")}>取消</div>
			</div>
			{inputValue ? (
				<div className='h-[calc(100vh-56px-56px)] overflow-y-auto py-[16px] px-[14px]'>
					{isSearching || isSearchPending ? (
						<div className="flex flex-col gap-[8px]">
							{Array.from({ length: 10 }).map((_, index) => (
								<TokenItemSkeleton key={index} />
							))}
						</div>
					) : searchResults.length > 0 ? (
						searchResults.map((item, index) => (
							<div key={item?.id ?? item?.coin_id ?? item?.address ?? index} className='mb-[8px]'>
								<TokenItem
									data={item}
									onClick={(clicked) => router.push(`/token/${clicked?.mint ?? clicked?.address ?? clicked?.coin_id ?? clicked?.id}`)}
								/>
							</div>
						))
					) : (
						<div className="flex items-center justify-center flex-col pt-[200px]">
							<img src="/images/nothing.png" className="w-[80px] h-[80px]" />
							<div className="text-[#868789] text-[14px]">暂无数据</div>
						</div>
					)}
				</div>
			) : (
				<div className="flex items-center justify-center flex-col pt-[200px]">
					<img src="/images/nothing.png" className="w-[80px] h-[80px]" />
					<div className="text-[#868789] text-[14px]">暂无数据</div>
				</div>
			)}
		</div>
	);
}
