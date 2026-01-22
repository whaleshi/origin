import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

type ScrollingNameProps = {
	text: string;
	className?: string;
};

export default function ScrollingName({ text, className }: ScrollingNameProps) {
	const [shouldScroll, setShouldScroll] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const measureRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const checkOverflow = () => {
			if (containerRef.current && measureRef.current) {
				const containerWidth = containerRef.current.offsetWidth;
				const textWidth = measureRef.current.offsetWidth;
				setShouldScroll(textWidth > containerWidth);
			}
		};

		const timer = setTimeout(checkOverflow, 300);
		window.addEventListener("resize", checkOverflow);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("resize", checkOverflow);
		};
	}, [text]);

	return (
		<div ref={containerRef} className={`relative w-full overflow-hidden ${className ?? ""}`}>
			<span ref={measureRef} className="absolute invisible whitespace-nowrap">
				{text}
			</span>
			<Marquee play={shouldScroll} gradient={false} speed={30} className={shouldScroll ? "" : "flex-start"}>
				<span className={shouldScroll ? "pr-8" : ""}>{text}</span>
			</Marquee>
		</div>
	);
}
