import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Chat } from ".prisma/client";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
	chatId: z.string(),
	needScreenshot: z.boolean(),
});

export const ChatTable = ({
	chats,
	submitCallback,
}: {
	chats: Chat[];
	submitCallback: (chatId: string, needScreenshot: boolean) => Promise<void>;
}) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const listEndRef = useRef<HTMLTableRowElement>(null);
	useEffect(() => {
		listEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chats]);

	const { toast } = useToast();

	const onsubmit = async (data: z.infer<typeof formSchema>) => {
		await submitCallback(data.chatId, data.needScreenshot);
		form.setValue("needScreenshot", false);
	};

	return (
		<>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onsubmit)}
					className="flex flex-col gap-6 items-center"
				>
					<div className="self-start mx-0 w-full">
						<FormField
							control={form.control}
							name="chatId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<RadioGroup
											onValueChange={field.onChange}
											defaultValue={field.value?.toString()}
										>
											<ScrollArea className=" h-[80vh]">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead className="w-10">選択</TableHead>
															<TableHead className="w-16">id</TableHead>
															<TableHead className="w-16">who</TableHead>
															<TableHead>内容</TableHead>
														</TableRow>
													</TableHeader>

													<TableBody>
														{chats.map((chat) => (
															<TableRow key={chat.id.toString()}>
																<TableCell>
																	<RadioGroupItem value={chat.id.toString()} />
																</TableCell>
																<TableCell>{chat.id}</TableCell>
																<TableCell>{chat.who}</TableCell>
																<TableCell>{chat.message}</TableCell>
															</TableRow>
														))}
														<TableRow ref={listEndRef} />
													</TableBody>
												</Table>
											</ScrollArea>
										</RadioGroup>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
							<FormField
								control={form.control}
								name="needScreenshot"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<p>スクショ</p>
						</div>
					</div>
					<Button
						type="submit"
						className="w-48"
						size={"lg"}
						onClick={() => {
							toast({
								title: "AIに送信しました",
							});
						}}
					>
						送信
					</Button>
				</form>
			</Form>
			<Toaster />
		</>
	);
};
