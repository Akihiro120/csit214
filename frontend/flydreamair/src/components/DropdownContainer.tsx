import { motion } from "motion/react";
import { useEffect, useRef } from "react";

interface Props {
	className?: string;
	children?: React.ReactNode;
}
export function DropdownContainer({ className, children }: Props) {
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function calculatePosition() {
			const dropdown = dropdownRef.current;
			if (!dropdown) return;

			// Get initial position from CSS (centered below trigger)
			const parent = dropdown.parentElement;
			if (!parent) return;

			// Get viewport measurements
			const dropdownRect = dropdown.getBoundingClientRect();
			const parentRect = parent.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			let desiredLeft = parentRect.left + parentRect.width / 2 - dropdownRect.width / 2;
			let desiredTop = parentRect.bottom;

			// Horizontal overflow check
			desiredLeft = Math.min(Math.max(0, desiredLeft), viewportWidth - dropdownRect.width - 8);

			// Vertical overflow check
			desiredTop = Math.min(Math.max(0, desiredTop), viewportHeight - dropdownRect.height - 8);

			// Apply adjusted positioning
			dropdown.style.left = `${desiredLeft}px`;
			dropdown.style.top = `${desiredTop}px`;
		}
		calculatePosition();
		window.addEventListener("resize", calculatePosition);
		window.addEventListener("scroll", calculatePosition);
		return () => {
			window.removeEventListener("resize", calculatePosition);
			window.removeEventListener("scroll", calculatePosition);
		};
	}, []);

	return (
		<motion.div
			ref={dropdownRef}
			variants={{
				hidden: { opacity: 0, y: "-0.5rem" },
				visible: { opacity: 1, y: 0 },
			}}
			initial="hidden"
			animate="visible"
			exit="hidden"
			className={`fixed z-50 my-3 left-1/2 top-1/2 ${className}`}
		>
			{children}
		</motion.div>
	);
}
