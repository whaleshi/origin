const LoadingIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" className="w-full h-full">
		<rect width="48" height="48" fill="black" />
		<path d="M15.5653 20.5285H13.2555L9.88006 24.2054V24.9237H15.5653V20.5354H17.4453V24.9237H18.3286V26.8608H17.4453V28.4412H15.5653V26.8608H8.97932C8.43854 26.8608 8.00003 26.4092 8 25.852V23.836C8.00002 23.578 8.09587 23.3298 8.26792 23.1425L12.1562 18.909L12.1742 18.8902C12.3576 18.7005 12.6071 18.5933 12.8676 18.5933H15.5653V20.5285Z" fill="#383838" />
		<path fill-rule="evenodd" clip-rule="evenodd" d="M27.9361 18.5588C28.4985 18.5588 28.9544 19.0286 28.9545 19.608V27.3571C28.9545 27.9366 28.4985 28.4063 27.9361 28.4063H20.2597C19.6973 28.4063 19.2413 27.9366 19.2413 27.3571V19.608C19.2413 19.0286 19.6973 18.5588 20.2597 18.5588H27.9361ZM21.1213 26.4692H27.0744V20.4959H21.1213V26.4692Z" fill="#383838" />
		<path d="M38.9816 18.5588C39.544 18.5588 39.9999 19.0286 40 19.608V23.5019C40 24.0813 39.544 24.551 38.9816 24.551H32.1664V26.4692H40V28.4063H31.3047C30.7423 28.4062 30.2864 27.9365 30.2863 27.3571V23.6632C30.2863 23.0837 30.7423 22.614 31.3047 22.614H38.1199V20.4959H30.2863V18.5588H38.9816Z" fill="#383838" />
	</svg>
)


const ErrorIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" className="w-full h-full">
		<rect width="48" height="48" fill="black" />
		<path d="M32.6445 18.0498C32.8785 18.6886 32.9961 19.4177 32.9961 20.2275V27.7676C32.9961 28.484 32.9029 29.1375 32.7227 29.7207C32.6712 29.8873 32.6124 30.0481 32.5469 30.2031C31.9899 31.5216 30.9316 32.4167 29.4668 32.7939C29.2946 32.8383 29.1168 32.8754 28.9336 32.9053C28.5667 32.9651 28.178 32.9961 27.7686 32.9961H20.2275L19.9277 32.9902C19.2372 32.9646 18.6096 32.8491 18.0508 32.6445L22.9004 27.7949L23.0352 27.876C23.7265 28.2537 24.65 28.1748 25.249 27.6602L28.9922 24.4473C29.2992 24.1837 29.6889 24.0359 30.0889 24.0029C30.2032 23.9935 30.3183 23.9935 30.4326 24.0029C30.4898 24.0077 30.5469 24.014 30.6035 24.0234C30.7164 24.0423 30.8277 24.0707 30.9355 24.1084C31.1514 24.1837 31.3539 24.2966 31.5293 24.4473L31.6465 24.5469V20.2275C31.6465 19.8406 31.6189 19.4804 31.5469 19.1475L32.6445 18.0498ZM27.7686 15C29.1078 15.0001 30.2236 15.3259 31.0781 15.9365L31.8086 15.207C32.0785 14.9371 32.5191 14.9371 32.7891 15.207C33.0677 15.477 33.0679 15.9089 32.7891 16.1787L16.1787 32.7881C16.0439 32.9229 15.8731 32.995 15.6934 32.9951C15.5135 32.9951 15.342 32.9237 15.207 32.7979C14.9371 32.5279 14.9371 32.0863 15.207 31.8164L15.9404 31.082C15.7743 30.8491 15.6279 30.5959 15.5039 30.3232C15.171 29.6034 15 28.7483 15 27.7676V20.2275C15 16.9524 16.9525 15.0001 20.2275 15H27.7686ZM20.2275 16.3496C17.6903 16.3497 16.3496 17.6903 16.3496 20.2275V27.7676C16.3496 28.4513 16.4671 29.0362 16.665 29.54L19.1455 27.875L30.1094 16.9062C29.5035 16.536 28.7193 16.3497 27.7686 16.3496H20.2275ZM21.2988 18.2568C22.4814 18.257 23.4403 19.2159 23.4404 20.3984C23.4404 21.5811 22.4814 22.5399 21.2988 22.54C20.1161 22.54 19.1572 21.5812 19.1572 20.3984C19.1573 19.2158 20.1162 18.2568 21.2988 18.2568Z" fill="#383838" />
	</svg>
)


import React, { forwardRef, useMemo, useState, useCallback, useEffect, type ReactNode } from "react";
import type { AvatarProps as BaseAvatarProps } from "@heroui/react";
import { AvatarIcon, useAvatar } from "@heroui/react";

export interface AvatarProps extends BaseAvatarProps {
	/**
	 * 可选形状：
	 * - circle: 完全圆形（默认）
	 * - rounded: 圆角矩形
	 * - square: 直角方形
	 */
	shape?: "circle" | "rounded" | "square";
	/**
	 * 自定义圆角（优先级高于 shape 映射），如 "12px" 或 12。
	 */
	borderRadius?: string | number;
}

const MyAvatarInner = forwardRef<HTMLSpanElement, AvatarProps>((props, ref) => {
	const { shape, borderRadius, radius: radiusProp, ...rest } = props;
	// 将自定义 shape 映射为 HeroUI 的 radius 取值
	const mappedRadius: BaseAvatarProps["radius"] | undefined = (() => {
		if (radiusProp) return radiusProp;
		if (!shape) return undefined; // 使用库默认（通常是 full）
		const map: Record<string, BaseAvatarProps["radius"]> = {
			circle: "full",
			rounded: "md",
			square: "none",
		} as const;
		return map[shape];
	})();
	const {
		src,
		icon = <AvatarIcon />,
		alt,
		classNames,
		slots,
		name,
		showFallback,
		fallback: fallbackComponent,
		getInitials,
		getAvatarProps,
		getImageProps,
	} = useAvatar({
		ref,
		...(mappedRadius ? { radius: mappedRadius } : {}),
		...rest,
	});

	// 统一 SSR 与首次客户端渲染：若有 src，初始一律认为 loading，避免水合不匹配
	const [isLoading, setIsLoading] = useState<boolean>(!!src);
	const [isError, setIsError] = useState(false);

	// 处理图片加载、错误状态
	const handleLoad = useCallback(() => {
		setIsLoading(false);
		setIsError(false);
	}, []);

	const handleError = useCallback(() => {
		setIsLoading(false);
		setIsError(true);
	}, []);

	// 仅当 src 变化时重置内部状态，避免无关重渲染引发短暂 fallback
	useEffect(() => {
		let active = true;
		if (!src) {
			setIsLoading(false);
			setIsError(false);
			return;
		}
		const img = new Image();
		img.src = src;
		if (img.complete) {
			active && setIsLoading(false);
			active && setIsError(false);
		} else {
			active && setIsLoading(true);
			active && setIsError(false);
			img.onload = () => { active && setIsLoading(false); };
			img.onerror = () => { active && setIsError(true); };
		}
		return () => { active = false; };
	}, [src]);

	const Wrapper = ({ children }: { children: ReactNode }) => (
		<span
			aria-label={alt || name || "avatar"}
			className={slots.fallback({ class: classNames?.fallback })}
			role="img"
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				...(borderRadius !== undefined
					? { borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius }
					: {}),
			}}
		>
			{children}
		</span>
	);

	const fallback = useMemo(() => {
		const ariaLabel = alt || name || "avatar";

		if (isError) return <Wrapper><ErrorIcon /></Wrapper>;
		if (isLoading) return <Wrapper><LoadingIcon /></Wrapper>;

		if (!showFallback && src && !isError) return null;

		if (fallbackComponent) {
			return (
				<div
					aria-label={ariaLabel}
					className={slots.fallback({ class: classNames?.fallback })}
					role="img"
				>
					{fallbackComponent}
				</div>
			);
		}

		if (name) {
			return (
				<span
					aria-label={ariaLabel}
					className={slots.name({ class: classNames?.name })}
					role="img"
				>
					{getInitials(name)}
				</span>
			);
		}

		return (
			<span
				aria-label={ariaLabel}
				className={slots.icon({ class: classNames?.icon })}
				role="img"
			>
				{icon}
			</span>
		);
	}, [
		alt,
		name,
		icon,
		src,
		isError,
		isLoading,
		showFallback,
		fallbackComponent,
		classNames,
		slots,
		getInitials,
	]);

	const imageProps = getImageProps();
	const containerProps = getAvatarProps();
	const mergedContainerStyle = {
		...(containerProps as any).style,
		...(borderRadius !== undefined
			? { borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius, overflow: "hidden" as const }
			: { overflow: "hidden" as const }),
		willChange: 'transform',
		contain: 'paint layout style',
	} as React.CSSProperties;
	const mergedImgStyle = {
		...(imageProps as any).style,
		...(borderRadius !== undefined
			? { borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius }
			: {}),
	} as React.CSSProperties;

	return (
		<div {...containerProps} style={mergedContainerStyle} suppressHydrationWarning>
			{src && !isError && (
				<img
					{...imageProps}
					alt={alt}
					style={mergedImgStyle}
					onLoad={(e) => { imageProps.onLoad?.(e); handleLoad(); }}
					onError={(e) => { imageProps.onError?.(e); handleError(); }}
				/>
			)}
			{fallback}
		</div>
	);
});

MyAvatarInner.displayName = "MyAvatar";

// 避免无关状态变更导致头像重渲染
const areEqual = (
	prevProps: Readonly<Omit<AvatarProps, "ref"> & React.RefAttributes<HTMLSpanElement>>, 
	nextProps: Readonly<Omit<AvatarProps, "ref"> & React.RefAttributes<HTMLSpanElement>>
): boolean => {
	return (
		prevProps.src === nextProps.src &&
		prevProps.alt === nextProps.alt &&
		prevProps.shape === nextProps.shape &&
		prevProps.borderRadius === nextProps.borderRadius &&
		prevProps.className === nextProps.className
	);
};

export default React.memo(MyAvatarInner, areEqual);

