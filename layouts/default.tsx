import Footer from "@/components/footer";
import { useState, useEffect } from "react";

export default function DefaultLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isValidScreen, setIsValidScreen] = useState(true);

	useEffect(() => {
		const checkScreenSize = () => {
			const width = window.innerWidth;
			setIsValidScreen((width >= 375));
		};

		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	if (!isValidScreen) {
		return (
			<div className="flex items-center justify-center h-screen w-screen bg-[#0D0F13] px-4">
				<div className="text-center">
					<div className="text-[20px] text-white mb-2">Screen Size Not Supported</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{children}
			<Footer />
		</>
	);
}
