import { createFileRoute } from "@tanstack/react-router";
import { DropdownButton } from "../components/DropdownButton";
import { DropdownProvider } from "../components/DropdownProvider";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<DropdownProvider>
			<form className="grid grid-cols-2 grid-rows-3 gap-6 text-white bg-(--primary) w-[70%] p-6 rounded-3xl shadow-md/25">
				<DropdownButton buttonContent={<InputBox label="Fly From" value="Sydney" />}>
					<div></div>
				</DropdownButton>
				<div className="flex">
					<InputBox label="Number of Passengers" value="1" />
				</div>
			</form>
		</DropdownProvider>
	);
}
function InputBox({ className, label, value }: { className?: string; label: string; value: string }) {
	return (
		<label
			className={`${className} grid grid-cols-[3rem_1fr] grid-rows-[auto_auto] rounded-sm border border-white p-1 gap-x-1 focus-within:border-[#00BFFFkk]`}
		>
			<div className="w-[2.5rem] h-[2.5rem] bg-white row-span-2 self-center justify-self-center"></div>
			<div className="text-sm text-[#ffffff99]">{label}</div>
			<div className="text-xl outline-none">{value}</div>
		</label>
	);
}
