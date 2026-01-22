import { useEffect, useState } from "react";

const pad2 = (value: number) => String(value).padStart(2, "0");

export default function useCountdown(endTs?: number | string | null) {
	const [countdown, setCountdown] = useState("00:00:00");

	useEffect(() => {
		if (!endTs || Number.isNaN(Number(endTs))) {
			setCountdown("00:00:00");
			return;
		}

		const updateCountdown = () => {
			const remainingMs = Math.max(0, Number(endTs) * 1000 - Date.now());
			const totalSeconds = Math.floor(remainingMs / 1000);
			const hours = Math.floor(totalSeconds / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = totalSeconds % 60;
			setCountdown(`${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`);
		};

		updateCountdown();
		const timer = setInterval(updateCountdown, 1000);
		return () => clearInterval(timer);
	}, [endTs]);

	return countdown;
}
