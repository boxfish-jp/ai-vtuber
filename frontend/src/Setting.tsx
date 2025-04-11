import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import endpointJson from "../../endpoint.json";
import { Button } from "./components/ui/button";
import {
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "./components/ui/drawer";
import { FormControl, FormField, FormItem } from "./components/ui/form";
import { Form } from "./components/ui/form";
import { Switch } from "./components/ui/switch";
import { Textarea } from "./components/ui/textarea";
import { useToast } from "./hooks/use-toast";
import type { SocketControler } from "./lib/socket";

const formSchema = z.object({
	main: z.string().default(""),
	sub: z.array(z.object({ theme: z.string() })).default([]),
});

export const Setting = ({ socket }: { socket: SocketControler }) => {
	const { toast } = useToast();
	const [workFlowState, setWorkFlowState] = useState(true);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			main: "",
			sub: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "sub",
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		console.log("submit");
		toast({
			title: "サーバーに送信しました",
		});
		const url = `http://${endpointJson.ai_vtuber.address}:${endpointJson.ai_vtuber.port}/work_theme`;
		await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				main: data.main,
				sub: data.sub.map((v) => v.theme),
			}),
		});
	};

	useEffect(() => {
		const workThemeRemove = socket.watchWorkTheme((workTheme) => {
			console.log("work_theme", workTheme);
			form.setValue("main", workTheme.main);
			form.setValue(
				"sub",
				workTheme.sub.map((theme) => ({
					theme,
				})),
			);
		});
		return workThemeRemove;
	}, [socket, form]);

	return (
		<DrawerContent>
			<DrawerHeader>
				<DrawerTitle>work_theme設定</DrawerTitle>
			</DrawerHeader>
			<div className="mb-8 mx-8">
				<Form {...form}>
					<form
						className="flex flex-col gap-2"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<section>
							<p>main</p>
							<FormField
								control={form.control}
								name="main"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Textarea placeholder="Input Prompt" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
						</section>
						<section>
							<p>sub</p>
							{fields.map((field, index) => {
								return (
									<div
										key={field.id}
										className="flex flex-row items-center gap-4"
									>
										<FormField
											control={form.control}
											name={`sub.${index}.theme`}
											render={({ field }) => (
												<FormItem className="flex-grow">
													<FormControl>
														<Textarea placeholder="Input Prompt" {...field} />
													</FormControl>
												</FormItem>
											)}
										/>
										<div>
											<Button type="button" onClick={() => remove(index)}>
												delete
											</Button>
										</div>
									</div>
								);
							})}
						</section>
						<div className="flex flex-row gap-3">
							<Button
								type="submit"
								className="bg-green-700 col-span-2 h-full w-full
      "
							>
								Submit
							</Button>
							<Button
								type="button"
								className="h-full w-20"
								onClick={() => {
									append({ theme: "" });
								}}
							>
								add
							</Button>
						</div>
					</form>
				</Form>
				<div className="mt-4 flex flex-row gap-3">
					<p>AIのワークフローの状態</p>
					<Switch
						checked={workFlowState}
						onCheckedChange={async (state) => {
							setWorkFlowState(state);
							const url = `http://${endpointJson.ai_vtuber.address}:${endpointJson.ai_vtuber.port}/workflow?state=${state}`;
							try {
								await fetch(url, {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
								});
							} catch (e) {
								console.log(e);
							}
						}}
					/>
				</div>
			</div>
		</DrawerContent>
	);
};
