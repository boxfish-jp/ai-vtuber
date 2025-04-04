import { useEffect, useState } from "react";
import supplementJson from "../../supplement.json";
import type { WorkTheme } from "./lib/socket";

export const Biim = ({
	subtitle,
	workTheme,
}: { subtitle: string; workTheme: WorkTheme }) => {
	const [supplement, setSupplement] = useState({
		content: "",
		index: 0,
	});
	const [interval, setNewInterval] = useState<NodeJS.Timeout | undefined>(
		undefined,
	);

	useEffect(() => {
		if (interval) {
			clearInterval(interval);
		}
		setNewInterval(
			setInterval(() => {
				const supplements = supplementParser(workTheme.main);
				const index =
					subtitle || supplement.index >= supplements.length - 1
						? 0
						: supplement.index + 1;
				setSupplement({
					content: supplements[index],
					index: index,
				});
			}, 20000),
		);

		return () => {
			clearInterval(interval);
		};
	}, [supplement, workTheme, subtitle]);

	return (
		<main className="w-[854px] h-[480px] bg-black flex flex-row items-end gap-1 p-1">
			<div className="w-full h-[80px] flex flex-row gap-1 justify-end">
				<div
					className={`w-[550px] border-[3px] border-white text-white p-3 ${subtitle ? "text-center" : "text-xs"}`}
				>
					{subtitle
						? subtitle
						: supplement.content
								.split("\n")
								.filter((content) => content)
								.map((content) => <p key={content}>{content}</p>)}
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

const supplementParser = (word: string) => {
	const past: string[] = [];
	const now: string[] = [];
	supplementJson.制作物.map((work) => {
		work.description.map((content) => {
			if (work.category.some((keyword) => word.includes(keyword))) {
				now.push(`
現在作業中の制作物: ${work.name}編 \n
${content}
`);
			} else {
				past.push(`
ふぐおの過去の制作物: ${work.name}編 \n
${content}
`);
			}
		});
	});
	supplementJson.使用している技術.map((work) => {
		work.description.map((content) => {
			if (work.category.some((keyword) => word.includes(keyword))) {
				now.push(`
現在作業中の制作物で使用している技術: ${work.name}編 \n
${content}
`);
			} else {
				past.push(`
ふぐおの過去の制作物で使用している技術: ${work.name}編 \n
${content}
`);
			}
		});
	});
	supplementJson.開発環境.map((work) => {
		work.description.map((content) => {
			past.push(`
ふぐおの開発環境: ${work.name}編 \n
${content}
`);
		});
	});
	supplementJson.プログラミング歴.map((content) => {
		past.push(`
ふぐおのプログラミング歴: \n
${content}
`);
	});

	return [...now, ...past];
};
