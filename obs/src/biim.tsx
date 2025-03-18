import type { WorkTheme } from "./lib/socket";

export const Biim = ({
	subtitle,
	workTheme,
}: { subtitle: string; workTheme: WorkTheme }) => {
	return (
		<main className="w-[854px] h-[480px] bg-black flex flex-row items-end gap-1 p-1">
			<div className="w-full h-[70px] flex flex-row gap-1 justify-end">
				<div className="w-[550px] border-[3px] border-white text-white text-center">
					{subtitle}
				</div>
			</div>
			<div className="w-[155px] h-full flex flex-col gap-1">
				<div className="h-[200px] border-[3px] border-white flex justify-center items-center">
					<p className="text-lg text-white text-center my-auto">
						{workTheme.main}
					</p>
				</div>
				<div className="h-full border-[3px] border-white">
					<p className="text-xl text-white text-center mb-4">作業の流れ</p>
					{workTheme.sub.map((content: string) => {
						const isLast = content === workTheme.sub[workTheme.sub.length - 1];
						return (
							<div key={content} className="my-auto ">
								<p
									className={`text-lg text-center ${isLast ? "text-red-500" : "text-white"}`}
								>
									{content}
								</p>
								{!isLast && (
									<p className="text-xs text-center my-auto text-white">↓</p>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</main>
	);
};
