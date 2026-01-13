import CreateForm from "@/components/form";
import { BackIcon } from "@/components/icons";
import { useIsMobile } from "@/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function CreatePage() {

	const router = useRouter();
	const isMobile = useIsMobile();
	const [hasChecked, setHasChecked] = useState(false);

	useEffect(() => {
		setHasChecked(true);
	}, []);

	useEffect(() => {
		if (!hasChecked) return;
		if (!isMobile) {
			router.replace("/");
		}
	}, [hasChecked, isMobile, router]);

	return (
		<div className="flex flex-col items-center w-full">
			<div className="h-[48px] flex items-center px-[16px] md:hidden w-full">
				<BackIcon />
				<div className="flex-1 flex items-center justify-center text-[17px] text-[#E6E6E6]">创建代币</div>
				<div className="w-[24px] h-[24px]"></div>
			</div>
			<CreateForm />
		</div>
	);
}
