
import MeList from "@/components/meList";
import { WalletBox } from "@/components/wallet";
import { useTranslation } from "react-i18next";

export default function Me() {
	const { t } = useTranslation();

	return <div className="px-[14px]">
		<div className="text-[28px] text-[#fff] font-bold my-[24px]">{t("Me.title")}</div>
		<WalletBox />
		<div className="mt-[24px]"><MeList /></div>
	</div>;
}
