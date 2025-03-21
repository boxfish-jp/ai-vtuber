import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { Textarea } from "./components/ui/textarea";
import { useToast } from "./hooks/use-toast";
import type { SocketControler } from "./lib/socket";

const formSchema = z.object({
	main: z.string().default(""),
	sub: z.array(z.object({ theme: z.string() })).default([]),
});

export const Setting = ({ socket }: { socket: SocketControler }) => {
	const { toast } = useToast();

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
			for (const theme of workTheme.sub) {
				append({ theme });
			}
		});
		return workThemeRemove;
	}, [socket, append, form]);

	return (
		<DrawerContent>
			<DrawerHeader>
				<DrawerTitle>work_theme設定</DrawerTitle>
			</DrawerHeader>
			<Form {...form}>
				<form
					className="flex flex-col gap-2 mx-8"
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
					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</DrawerContent>
	);
};
