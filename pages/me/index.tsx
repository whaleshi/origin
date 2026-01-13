
import MeList from "@/components/meList";
import { WalletBox } from "@/components/wallet";


export default function Me() {


	return <div className="px-[14px]">
		<div className="text-[28px] text-[#fff] font-bold my-[24px]">我的</div>
		<WalletBox />
		<div className="mt-[24px]"><MeList /></div>
	</div>;
}
