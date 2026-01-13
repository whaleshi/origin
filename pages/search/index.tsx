import { CloseIcon, SearchInputIcon } from "@/components/icons";
import TokenItem from "@/components/tokenItem";
import { Input } from "@heroui/react";
import router from "next/router";
import { useState } from "react";

export default function SearchPage() {
	const [inputValue, setInputValue] = useState("");
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
			{
				inputValue ? <div className='h-[calc(100vh-56px-56px)] overflow-y-auto py-[16px] px-[14px]'>
					{
						Array.from({ length: 19 }).map((_, index) => (
							<div key={index} className='mb-[8px]'>
								<TokenItem type={2} />
							</div>
						))
					}
				</div> : <div className="flex items-center justify-center flex-col pt-[200px]">
					<img src="/images/nothing.png" className="w-[80px] h-[80px]" />
					<div className="text-[#868789] text-[14px]">暂无数据</div>
				</div>
			}
		</div>
	);
}
