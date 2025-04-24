import { motion } from "motion/react";
import { useEffect } from "react";

interface Props {
	dropdownMenuRef: React.RefObject<HTMLDivElement | null>;
	dropdownButtonRef: React.RefObject<HTMLButtonElement | null>;
	className?: string;
	children?: React.ReactNode;
}
export function DropdownMenu({ dropdownMenuRef, dropdownButtonRef, className, children }: Props) {
	useEffect(() => {
		function calculatePosition() {
			// Check if refs are defined
			const menu = dropdownMenuRef.current;
			if (!menu) return;
			const button = dropdownButtonRef.current;
			if (!button) return;

			// Get viewport measurements
			const menuRect = menu.getBoundingClientRect();
			const buttonRect = button.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Calculate desired position
			let desiredLeft = buttonRect.left + buttonRect.width / 2 - menuRect.width / 2;
			let desiredTop = buttonRect.bottom;

			// Horizontal overflow check
			desiredLeft = Math.min(Math.max(0, desiredLeft), viewportWidth - menuRect.width - 8);

			// Vertical overflow check
			desiredTop = Math.min(Math.max(0, desiredTop), viewportHeight - menuRect.height - 8);

			// Apply adjusted positioning
			menu.style.left = `${desiredLeft}px`;
			menu.style.top = `${desiredTop}px`;
		}
		calculatePosition();
		window.addEventListener("resize", calculatePosition);
		window.addEventListener("scroll", calculatePosition);
		return () => {
			window.removeEventListener("resize", calculatePosition);
			window.removeEventListener("scroll", calculatePosition);
		};
	}, [dropdownButtonRef, dropdownMenuRef]);

	return (
		<motion.div
			ref={dropdownMenuRef}
			variants={{
				hidden: { opacity: 0, y: "0.3rem" },
				visible: { opacity: 1, y: "0.75rem" },
			}}
			initial="hidden"
			animate="visible"
			exit="hidden"
			className={`${className} absolute z-50 left-1/2 top-1/2`}
		>
			{children}
		</motion.div>
	);
}
