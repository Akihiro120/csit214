import { AnimatePresence, motion } from "motion/react";
import React, { useContext, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { DropdownContext } from "../context/dropdownContext";

interface Props {
	staticId?: string;
	buttonContent: React.ReactNode;
	className?: string;
	children: React.ReactNode;
	hoverOverlayTheme?: "fontColor" | "bgColor";
}

export function DropdownButton({ staticId, buttonContent, className, children, hoverOverlayTheme }: Props) {
	// setup unique id for each button
	const id = useRef(uuidv4());
	if (staticId) {
		id.current = staticId;
	}
	// check if DropdownButton is used within DropdownProvider
	const context = useContext(DropdownContext);
	if (!context) {
		throw new Error("DropdownButton must be used within a DropdownProvider");
	}
	const { activeButtonId, setActiveButtonId } = context;
	// create a ref for the dropdown area
	const dropdownAreaRef = useRef<HTMLDivElement>(null);

	// reset all trackers if outside click is detected
	useEffect(() => {
		function outsideClickHandler(event: MouseEvent) {
			if (
				dropdownAreaRef.current &&
				!dropdownAreaRef.current.contains(event.target as Node) &&
				activeButtonId === id.current
			) {
				setActiveButtonId(null);
			}
		}
		document.addEventListener("mousedown", outsideClickHandler);
		return () => {
			document.removeEventListener("mousedown", outsideClickHandler);
		};
	}, [dropdownAreaRef, activeButtonId, setActiveButtonId]);

	return (
		<div className={`relative`} ref={dropdownAreaRef}>
			<button
				/* set to active on click */
				onClick={() => {
					if (activeButtonId !== id.current) {
						setActiveButtonId(id.current);
					} else {
						setActiveButtonId(null);
					}
				}}
				className={`relative ${className}`}
			>
				{/* darken background overlay */}
				{hoverOverlayTheme ? (
					<motion.div
						variants={{
							default: { opacity: 0 },
							hover: { opacity: 0.16 },
							active: { opacity: 0.22 },
						}}
						initial="default"
						whileHover={activeButtonId === id.current ? "active" : "hover"}
						animate={activeButtonId === id.current ? "active" : "default"}
						className={`absolute z-30 top-0 left-0 w-full h-full rounded-[inherit] ${hoverOverlayTheme === "fontColor" ? "bg-[--fg-color-hover]" : "bg-[--bg-color-hover]"}`}
					></motion.div>
				) : null}
				{buttonContent}
			</button>
			<AnimatePresence>{activeButtonId === id.current && children}</AnimatePresence>
		</div>
	);
}
