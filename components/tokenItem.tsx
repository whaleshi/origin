import MyAvatar from "@/components/avatar";
import { ItemIcon } from "./icons";
import router from "next/router";

interface TokenItemProps {
	type: number;
	bg?: string;
}

export default function TokenItem({ type, bg }: TokenItemProps) {
	return (
		<div
			className="w-full h-[64px] rounded-[8px] p-[12px] flex items-center cursor-pointer"
			style={{ backgroundColor: bg || "#191B1F" }}
			onClick={() => router.push("/token/1")}
		>
		<div className={`w-[46px] h-[46px] border-[1.5px] ${type === 3 ? 'border-[#FD7438]' : 'border-transparent'} rounded-full flex items-center justify-center relative`}>
			<MyAvatar src={"/images/test.png"} alt="icon" className="w-[40px] h-[40px] bg-[transparent]" />
			{type === 3 && <ItemIcon className="absolute -bottom-[1px] -right-[1px]" />}
		</div>
		<div className='flex flex-col justify-between ml-[8px]'>
			<div className='text-[14px] text-[#fff]'>launchcoin</div>
			{
				type === 1 ? <div className='text-[12px] text-[#868789]'>Launchcoin</div>
					: <div className='text-[12px] text-[#4A4B4E]'>Price <span className="text-[#868789]">$0.0743</span></div>
			}
		</div>
		<div className='ml-auto'>
			{
				type === 1 ? <div
					className="w-[70px] h-[32px] rounded-[8px] flex items-center justify-center"
					style={{
						background: `conic-gradient(#FD7438 0deg ${(0.1 * 360)}deg, #303135 ${(0.1 * 360)}deg 360deg)`,
						padding: '2px'
					}}
				>
					<div className="w-full h-full bg-[#191B1F] rounded-[6px] flex items-center justify-center">
						<span className="text-[14px] text-[#fff]">
							10%
						</span>
					</div>
				</div> : <div className='flex flex-col justify-between items-end'>
					<div className="text-[14px] text-[#fff]">$0.0743</div>
					<div className="text-[12px] text-[#4A4B4E]">24H<span className="ml-[2px] text-[#17C964]">14.39%</span></div>
					{/* text-[#FF5160] */}
				</div>
			}
		</div>
		</div>
	);
}
