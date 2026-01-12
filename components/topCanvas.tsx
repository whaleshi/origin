import React, { useEffect, useRef } from 'react';
import easingUtils from 'easing-utils';

// --- 类型定义 ---
interface Disc {
	x: number; y: number; w: number; h: number; p: number;
}

interface Particle {
	x: number; sx: number; dx: number; y: number; vy: number; p: number; r: number; c: string;
}

interface RenderConfig {
	width: number; height: number; dpi: number;
}

const THEME_COLOR = '#0D0F13'; // 定义统一主题色

const BlackHole: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const stateRef = useRef({
		ctx: null as CanvasRenderingContext2D | null,
		discs: [] as Disc[],
		lines: [] as { x: number, y: number }[][],
		particles: [] as Particle[],
		render: { width: 0, height: 0, dpi: 1 } as RenderConfig,
		rect: { width: 0, height: 0 } as DOMRect | { width: number, height: number },
		startDisc: { x: 0, y: 0, w: 0, h: 0 },
		endDisc: { x: 0, y: 0, w: 0, h: 0 },
		clip: { disc: {} as Disc, i: 0, path: new Path2D() },
		linesCanvas: null as HTMLCanvasElement | null,
		particleArea: { sw: 0, ew: 0, h: 0, sx: 0, ex: 0 },
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const s = stateRef.current;
		s.ctx = canvas.getContext('2d');
		if (!s.ctx) return;

		const tweenValue = (start: number, end: number, p: number, ease: string | boolean = false) => {
			const delta = end - start;
			const easeName = typeof ease === 'string' ? `ease${ease.charAt(0).toUpperCase()}${ease.slice(1)}` : 'linear';
			// @ts-ignore
			const easeFn = easingUtils[easeName] || easingUtils.linear;
			return start + delta * easeFn(p);
		};

		const tweenDisc = (disc: any) => {
			disc.x = tweenValue(s.startDisc.x, s.endDisc.x, disc.p);
			disc.y = tweenValue(s.startDisc.y, s.endDisc.y, disc.p, "inExpo");
			disc.w = tweenValue(s.startDisc.w, s.endDisc.w, disc.p);
			disc.h = tweenValue(s.startDisc.h, s.endDisc.h, disc.p);
			return disc;
		};

		const setSize = () => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			s.rect = rect;
			s.render = { width: rect.width, height: rect.height, dpi: window.devicePixelRatio };
			canvas.width = s.render.width * s.render.dpi;
			canvas.height = s.render.height * s.render.dpi;
		};

		const setDiscs = () => {
			const { width, height } = s.rect;
			s.discs = [];
			s.startDisc = { x: width * 0.5, y: height * 0.45, w: width * 0.75, h: height * 0.7 };
			s.endDisc = { x: width * 0.5, y: height * 0.95, w: 0, h: 0 };

			let prevBottom = height;
			const totalDiscs = 100;

			for (let i = 0; i < totalDiscs; i++) {
				const disc = tweenDisc({ p: i / totalDiscs });
				const bottom = disc.y + disc.h;
				if (bottom <= prevBottom) {
					s.clip = { ...s.clip, disc: { ...disc }, i };
				}
				prevBottom = bottom;
				s.discs.push(disc);
			}

			const path = new Path2D();
			path.ellipse(s.clip.disc.x, s.clip.disc.y, s.clip.disc.w, s.clip.disc.h, 0, 0, Math.PI * 2);
			path.rect(s.clip.disc.x - s.clip.disc.w, 0, s.clip.disc.w * 2, s.clip.disc.y);
			s.clip.path = path;
		};

		const setLines = () => {
			const { width, height } = s.rect;
			s.lines = Array.from({ length: 100 }, () => []);
			const linesAngle = (Math.PI * 2) / 100;

			s.discs.forEach((disc) => {
				for (let i = 0; i < 100; i++) {
					const angle = i * linesAngle;
					s.lines[i].push({
						x: disc.x + Math.cos(angle) * disc.w,
						y: disc.y + Math.sin(angle) * disc.h
					});
				}
			});

			const lCanvas = document.createElement('canvas');
			lCanvas.width = width;
			lCanvas.height = height;
			const lCtx = lCanvas.getContext('2d')!;

			s.lines.forEach((line) => {
				lCtx.save();
				let lineIsIn = false;
				line.forEach((p1, j) => {
					if (j === 0) return;
					const p0 = line[j - 1];
					if (!lineIsIn && (lCtx.isPointInPath(s.clip.path, p1.x, p1.y))) {
						lineIsIn = true;
					} else if (lineIsIn) {
						lCtx.clip(s.clip.path);
					}
					lCtx.beginPath();
					lCtx.moveTo(p0.x, p0.y);
					lCtx.lineTo(p1.x, p1.y);
					lCtx.strokeStyle = "rgba(68, 68, 68, 0.5)"; // 稍微调淡线条
					lCtx.lineWidth = 1.5;
					lCtx.stroke();
					lCtx.closePath();
				});
				lCtx.restore();
			});
			s.linesCanvas = lCanvas;
		};

		const initParticle = (start = false): Particle => {
			const sx = s.particleArea.sx + s.particleArea.sw * Math.random();
			const ex = s.particleArea.ex + s.particleArea.ew * Math.random();
			const y = start ? s.particleArea.h * Math.random() : s.particleArea.h;
			return {
				x: sx, sx, dx: ex - sx, y, vy: 0.5 + Math.random(),
				p: 0, r: 0.5 + Math.random() * 4,
				c: `rgba(255, 255, 255, ${Math.random() * 0.6})` // 降低粒子最大亮度
			};
		};

		const setParticles = () => {
			const { width, height } = s.rect;
			s.particleArea = {
				sw: s.clip.disc.w * 0.5, ew: s.clip.disc.w * 2, h: height * 0.85,
				sx: (width - (s.clip.disc.w * 0.5)) / 2,
				ex: (width - (s.clip.disc.w * 2)) / 2
			};
			s.particles = Array.from({ length: 100 }, () => initParticle(true));
		};

		const tick = () => {
			if (!s.ctx) return;
			// 关键：确保清空画布，使背景透出
			s.ctx.clearRect(0, 0, canvas.width, canvas.height);

			s.ctx.save();
			s.ctx.scale(s.render.dpi, s.render.dpi);

			s.discs.forEach((disc) => {
				disc.p = (disc.p + 0.001) % 1;
				tweenDisc(disc);
			});

			s.particles.forEach((particle) => {
				particle.p = 1 - particle.y / s.particleArea.h;
				particle.x = particle.sx + particle.dx * particle.p;
				particle.y -= particle.vy;
				if (particle.y < 0) Object.assign(particle, initParticle());
			});

			s.ctx.strokeStyle = "rgba(68, 68, 68, 0.3)";
			s.ctx.lineWidth = 1.5;
			s.ctx.beginPath();
			s.ctx.ellipse(s.startDisc.x, s.startDisc.y, s.startDisc.w, s.startDisc.h, 0, 0, Math.PI * 2);
			s.ctx.stroke();

			s.discs.forEach((disc, i) => {
				if (i % 5 !== 0) return;
				if (disc.w < s.clip.disc.w - 5) { s.ctx!.save(); s.ctx!.clip(s.clip.path); }
				s.ctx!.beginPath();
				s.ctx!.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
				s.ctx!.stroke();
				if (disc.w < s.clip.disc.w - 5) { s.ctx!.restore(); }
			});

			if (s.linesCanvas) s.ctx.drawImage(s.linesCanvas, 0, 0);

			s.ctx.save();
			s.ctx.clip(s.clip.path);
			s.particles.forEach((particle) => {
				s.ctx!.fillStyle = particle.c;
				s.ctx!.beginPath();
				s.ctx!.rect(particle.x, particle.y, particle.r, particle.r);
				s.ctx!.fill();
			});
			s.ctx.restore();

			s.ctx.restore();
			rafRef.current = requestAnimationFrame(tick);
		};

		const onResize = () => {
			setSize(); setDiscs(); setLines(); setParticles();
		};

		setSize(); setDiscs(); setLines(); setParticles();
		window.addEventListener('resize', onResize);
		const rafRef = { current: requestAnimationFrame(tick) };

		return () => {
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<div ref={containerRef} style={styles.container}>
			<style>{`
                @keyframes aura-glow {
                    0% { background-position: 0 100%; }
                    100% { background-position: 0 300%; }
                }
            `}</style>

			<canvas ref={canvasRef} style={styles.canvas} />
			<div style={styles.aura} />
			<div style={styles.overlay} />

			{/* 核心修改：渐变边缘与背景色融合 */}
			<div style={styles.pseudoBefore} />
			<div style={styles.pseudoAfter} />
		</div>
	);
};

// --- CSS 样式对象 (已更新颜色) ---
const styles: Record<string, React.CSSProperties> = {
	container: {
		position: 'relative', top: 0, left: 0, width: '100%', height: '100%',
		margin: 0, padding: 0, overflow: 'hidden',
		background: THEME_COLOR, // 使用主题色
		fontFamily: "'Martian Mono', monospace",
	},
	canvas: { display: 'block', width: '100%', height: '100%', background: 'transparent' },
	aura: {
		position: 'absolute', top: '-71.5%', left: '50%', zIndex: 3,
		width: '30%', height: '140%', transform: 'translate3d(-50%, 0, 0)',
		background: 'linear-gradient(20deg, #00f8f1, #ffbd1e20 16.5%, #fe848f 33%, #fe848f20 49.5%, #00f8f1 66%, #00f8f160 85.5%, #ffbd1e 100%) 0 100% / 100% 200%',
		borderRadius: '0 0 100% 100%', filter: 'blur(50px)', mixBlendMode: 'plus-lighter', opacity: 0.6,
		animation: 'aura-glow 5s infinite linear', pointerEvents: 'none'
	},
	overlay: {
		position: 'absolute', top: 0, left: 0, zIndex: 10, width: '100%', height: '100%',
		background: 'repeating-linear-gradient(transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px)',
		mixBlendMode: 'overlay', opacity: 0.4, pointerEvents: 'none',
	},
	pseudoBefore: {
		position: 'absolute', top: '50%', left: '50%', zIndex: 2,
		width: '150%', height: '140%', transform: 'translate3d(-50%, -50%, 0)',
		// 修改点：从透明过渡到主题色 THEME_COLOR
		background: `radial-gradient(ellipse at 50% 55%, transparent 10%, ${THEME_COLOR} 50%)`,
		pointerEvents: 'none',
	},
	pseudoAfter: {
		position: 'absolute', top: '50%', left: '50%', zIndex: 5,
		width: '100%', height: '100%', transform: 'translate3d(-50%, -50%, 0)',
		background: 'radial-gradient(ellipse at 50% 75%, #a900ff 15%, transparent 70%)',
		mixBlendMode: 'overlay', opacity: 0.5, pointerEvents: 'none',
	}
};

export default BlackHole;

// import React, { useEffect, useRef } from 'react';
// import easingUtils from 'easing-utils';

// // --- 类型定义 ---
// interface Disc {
// 	x: number; y: number; w: number; h: number; p: number;
// }

// interface Particle {
// 	x: number; sx: number; dx: number; y: number; vy: number; p: number; r: number; c: string;
// }

// interface RenderConfig {
// 	width: number; height: number; dpi: number;
// }

// const BlackHole: React.FC = () => {
// 	const canvasRef = useRef<HTMLCanvasElement | null>(null);
// 	const containerRef = useRef<HTMLDivElement | null>(null);

// 	// 一比一还原原类中的所有成员变量
// 	const stateRef = useRef({
// 		ctx: null as CanvasRenderingContext2D | null,
// 		discs: [] as Disc[],
// 		lines: [] as { x: number, y: number }[][],
// 		particles: [] as Particle[],
// 		render: { width: 0, height: 0, dpi: 1 } as RenderConfig,
// 		rect: { width: 0, height: 0 } as DOMRect | { width: number, height: number },
// 		startDisc: { x: 0, y: 0, w: 0, h: 0 },
// 		endDisc: { x: 0, y: 0, w: 0, h: 0 },
// 		clip: { disc: {} as Disc, i: 0, path: new Path2D() },
// 		linesCanvas: null as HTMLCanvasElement | null,
// 		particleArea: { sw: 0, ew: 0, h: 0, sx: 0, ex: 0 },
// 	});

// 	useEffect(() => {
// 		const canvas = canvasRef.current;
// 		if (!canvas) return;
// 		const s = stateRef.current;
// 		s.ctx = canvas.getContext('2d');
// 		if (!s.ctx) return;

// 		// --- 一比一还原函数逻辑 ---

// 		const tweenValue = (start: number, end: number, p: number, ease: string | boolean = false) => {
// 			const delta = end - start;
// 			const easeName = typeof ease === 'string' ? `ease${ease.charAt(0).toUpperCase()}${ease.slice(1)}` : 'linear';
// 			// @ts-ignore
// 			const easeFn = easingUtils[easeName] || easingUtils.linear;
// 			return start + delta * easeFn(p);
// 		};

// 		const tweenDisc = (disc: any) => {
// 			disc.x = tweenValue(s.startDisc.x, s.endDisc.x, disc.p);
// 			disc.y = tweenValue(s.startDisc.y, s.endDisc.y, disc.p, "inExpo");
// 			disc.w = tweenValue(s.startDisc.w, s.endDisc.w, disc.p);
// 			disc.h = tweenValue(s.startDisc.h, s.endDisc.h, disc.p);
// 			return disc;
// 		};

// 		const setSize = () => {
// 			const rect = containerRef.current?.getBoundingClientRect();
// 			if (!rect) return;
// 			s.rect = rect;
// 			s.render = { width: rect.width, height: rect.height, dpi: window.devicePixelRatio };
// 			canvas.width = s.render.width * s.render.dpi;
// 			canvas.height = s.render.height * s.render.dpi;
// 		};

// 		const setDiscs = () => {
// 			const { width, height } = s.rect;
// 			s.discs = [];
// 			s.startDisc = { x: width * 0.5, y: height * 0.45, w: width * 0.75, h: height * 0.7 };
// 			s.endDisc = { x: width * 0.5, y: height * 0.95, w: 0, h: 0 };

// 			let prevBottom = height;
// 			const totalDiscs = 100;

// 			for (let i = 0; i < totalDiscs; i++) {
// 				const disc = tweenDisc({ p: i / totalDiscs });
// 				const bottom = disc.y + disc.h;
// 				if (bottom <= prevBottom) {
// 					s.clip = { ...s.clip, disc: { ...disc }, i };
// 				}
// 				prevBottom = bottom;
// 				s.discs.push(disc);
// 			}

// 			const path = new Path2D();
// 			path.ellipse(s.clip.disc.x, s.clip.disc.y, s.clip.disc.w, s.clip.disc.h, 0, 0, Math.PI * 2);
// 			path.rect(s.clip.disc.x - s.clip.disc.w, 0, s.clip.disc.w * 2, s.clip.disc.y);
// 			s.clip.path = path;
// 		};

// 		const setLines = () => {
// 			const { width, height } = s.rect;
// 			s.lines = Array.from({ length: 100 }, () => []);
// 			const linesAngle = (Math.PI * 2) / 100;

// 			s.discs.forEach((disc) => {
// 				for (let i = 0; i < 100; i++) {
// 					const angle = i * linesAngle;
// 					s.lines[i].push({
// 						x: disc.x + Math.cos(angle) * disc.w,
// 						y: disc.y + Math.sin(angle) * disc.h
// 					});
// 				}
// 			});

// 			const lCanvas = document.createElement('canvas');
// 			lCanvas.width = width;
// 			lCanvas.height = height;
// 			const lCtx = lCanvas.getContext('2d')!;

// 			s.lines.forEach((line) => {
// 				lCtx.save();
// 				let lineIsIn = false;
// 				line.forEach((p1, j) => {
// 					if (j === 0) return;
// 					const p0 = line[j - 1];
// 					if (!lineIsIn && (lCtx.isPointInPath(s.clip.path, p1.x, p1.y))) {
// 						lineIsIn = true;
// 					} else if (lineIsIn) {
// 						lCtx.clip(s.clip.path);
// 					}
// 					lCtx.beginPath();
// 					lCtx.moveTo(p0.x, p0.y);
// 					lCtx.lineTo(p1.x, p1.y);
// 					lCtx.strokeStyle = "#444";
// 					lCtx.lineWidth = 2;
// 					lCtx.stroke();
// 					lCtx.closePath();
// 				});
// 				lCtx.restore();
// 			});
// 			s.linesCanvas = lCanvas;
// 		};

// 		const initParticle = (start = false): Particle => {
// 			const sx = s.particleArea.sx + s.particleArea.sw * Math.random();
// 			const ex = s.particleArea.ex + s.particleArea.ew * Math.random();
// 			const y = start ? s.particleArea.h * Math.random() : s.particleArea.h;
// 			return {
// 				x: sx, sx, dx: ex - sx, y, vy: 0.5 + Math.random(),
// 				p: 0, r: 0.5 + Math.random() * 4,
// 				c: `rgba(255, 255, 255, ${Math.random()})`
// 			};
// 		};

// 		const setParticles = () => {
// 			const { width, height } = s.rect;
// 			s.particleArea = {
// 				sw: s.clip.disc.w * 0.5, ew: s.clip.disc.w * 2, h: height * 0.85,
// 				sx: (width - (s.clip.disc.w * 0.5)) / 2,
// 				ex: (width - (s.clip.disc.w * 2)) / 2
// 			};
// 			s.particles = Array.from({ length: 100 }, () => initParticle(true));
// 		};

// 		const tick = () => {
// 			if (!s.ctx) return;
// 			s.ctx.clearRect(0, 0, canvas.width, canvas.height);
// 			s.ctx.save();
// 			s.ctx.scale(s.render.dpi, s.render.dpi);

// 			// moveDiscs
// 			s.discs.forEach((disc) => {
// 				disc.p = (disc.p + 0.001) % 1;
// 				tweenDisc(disc);
// 			});

// 			// moveParticles
// 			s.particles.forEach((particle) => {
// 				particle.p = 1 - particle.y / s.particleArea.h;
// 				particle.x = particle.sx + particle.dx * particle.p;
// 				particle.y -= particle.vy;
// 				if (particle.y < 0) Object.assign(particle, initParticle());
// 			});

// 			// drawDiscs
// 			s.ctx.strokeStyle = "#444";
// 			s.ctx.lineWidth = 2;
// 			s.ctx.beginPath();
// 			s.ctx.ellipse(s.startDisc.x, s.startDisc.y, s.startDisc.w, s.startDisc.h, 0, 0, Math.PI * 2);
// 			s.ctx.stroke();
// 			s.ctx.closePath();

// 			s.discs.forEach((disc, i) => {
// 				if (i % 5 !== 0) return;
// 				if (disc.w < s.clip.disc.w - 5) { s.ctx!.save(); s.ctx!.clip(s.clip.path); }
// 				s.ctx!.beginPath();
// 				s.ctx!.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
// 				s.ctx!.stroke();
// 				s.ctx!.closePath();
// 				if (disc.w < s.clip.disc.w - 5) { s.ctx!.restore(); }
// 			});

// 			// drawLines
// 			if (s.linesCanvas) s.ctx.drawImage(s.linesCanvas, 0, 0);

// 			// drawParticles
// 			s.ctx.save();
// 			s.ctx.clip(s.clip.path);
// 			s.particles.forEach((particle) => {
// 				s.ctx!.fillStyle = particle.c;
// 				s.ctx!.beginPath();
// 				s.ctx!.rect(particle.x, particle.y, particle.r, particle.r);
// 				s.ctx!.fill();
// 				s.ctx!.closePath();
// 			});
// 			s.ctx.restore();

// 			s.ctx.restore();
// 			rafRef.current = requestAnimationFrame(tick);
// 		};

// 		// --- 初始化流程 ---
// 		const onResize = () => {
// 			setSize(); setDiscs(); setLines(); setParticles();
// 		};

// 		setSize(); setDiscs(); setLines(); setParticles();
// 		window.addEventListener('resize', onResize);
// 		const rafRef = { current: requestAnimationFrame(tick) };

// 		return () => {
// 			window.removeEventListener('resize', onResize);
// 			cancelAnimationFrame(rafRef.current);
// 		};
// 	}, []);

// 	return (
// 		<div ref={containerRef} style={styles.container}>
// 			<style>{`
//         @keyframes aura-glow {
//           0% { background-position: 0 100%; }
//           100% { background-position: 0 300%; }
//         }
//       `}</style>

// 			<canvas ref={canvasRef} style={styles.canvas} />
// 			<div style={styles.aura} />
// 			<div style={styles.overlay} />

// 			{/* 伪元素还原 */}
// 			<div style={styles.pseudoBefore} />
// 			<div style={styles.pseudoAfter} />
// 		</div>
// 	);
// };

// // --- CSS 样式对象 ---
// const styles: Record<string, React.CSSProperties> = {
// 	container: {
// 		position: 'relative', top: 0, left: 0, width: '100%', height: '100%',
// 		margin: 0, padding: 0, overflow: 'hidden', background: 'black',
// 		fontFamily: "'Martian Mono', monospace",
// 	},
// 	canvas: { display: 'block', width: '100%', height: '100%' },
// 	aura: {
// 		position: 'absolute', top: '-71.5%', left: '50%', zIndex: 3,
// 		width: '30%', height: '140%', transform: 'translate3d(-50%, 0, 0)',
// 		background: 'linear-gradient(20deg, #00f8f1, #ffbd1e20 16.5%, #fe848f 33%, #fe848f20 49.5%, #00f8f1 66%, #00f8f160 85.5%, #ffbd1e 100%) 0 100% / 100% 200%',
// 		borderRadius: '0 0 100% 100%', filter: 'blur(50px)', mixBlendMode: 'plus-lighter', opacity: 0.75,
// 		animation: 'aura-glow 5s infinite linear', pointerEvents: 'none'
// 	},
// 	overlay: {
// 		position: 'absolute', top: 0, left: 0, zIndex: 10, width: '100%', height: '100%',
// 		background: 'repeating-linear-gradient(transparent, transparent 1px, white 1px, white 2px)',
// 		mixBlendMode: 'overlay', opacity: 0.5, pointerEvents: 'none',
// 	},
// 	pseudoBefore: {
// 		position: 'absolute', top: '50%', left: '50%', zIndex: 2,
// 		width: '150%', height: '140%', transform: 'translate3d(-50%, -50%, 0)',
// 		background: 'radial-gradient(ellipse at 50% 55%, transparent 10%, black 50%)',
// 		pointerEvents: 'none',
// 	},
// 	pseudoAfter: {
// 		position: 'absolute', top: '50%', left: '50%', zIndex: 5,
// 		width: '100%', height: '100%', transform: 'translate3d(-50%, -50%, 0)',
// 		background: 'radial-gradient(ellipse at 50% 75%, #a900ff 20%, transparent 75%)',
// 		mixBlendMode: 'overlay', pointerEvents: 'none',
// 	}
// };

// export default BlackHole;
