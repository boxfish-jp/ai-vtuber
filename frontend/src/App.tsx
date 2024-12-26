import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./components/ui/button";
import { Form, FormControl, FormField, FormItem } from "./components/ui/form";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { ScrollArea } from "./components/ui/scroll-area";
import { Switch } from "./components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./components/ui/table";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import { SocketControler, type socketServerChatType } from "./lib/socket";
import { speechRecognition } from "./lib/speechrecognition";

const formSchema = z.object({
	unixTime: z.number(),
	needScreenshot: z.boolean().default(false),
});

function App() {
	const [chats, setChats] = useState<socketServerChatType[]>([]);
	const listEndRef = useRef<HTMLTableRowElement>(null);
	const { toast } = useToast();
	let socket: SocketControler | undefined = undefined;

	useEffect(() => {
		socket = new SocketControler();
		speechRecognition((eventName, content) => {
			socket?.sendEvent(eventName, content);
		});
		socket?.watchChat((chat) => {
			setChats((prev) => [...prev, chat]);
			listEndRef.current?.scrollIntoView({ behavior: "smooth" });
			console.log("chats", chats);
		});
	}, [socket]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		console.log("submit");
		toast({
			title: "AIに送信しました",
		});
		socket?.sendEvent(
			"talkToAi",
			JSON.stringify({
				unixTime: data.unixTime,
				needScreenshot: data.needScreenshot,
			}),
		);
		form.setValue("needScreenshot", false);
	};

	return (
		<div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-6 items-center"
				>
					<div className="self-start mx-0 w-full">
						<FormField
							control={form.control}
							name="unixTime"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<RadioGroup
											onValueChange={(value) => {
												field.onChange(value);
												form.handleSubmit(onSubmit)();
											}}
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
															<TableRow key={chat.unixTime.toString()}>
																<TableCell>
																	<RadioGroupItem
																		value={chat.unixTime.toString()}
																	/>
																</TableCell>
																<TableCell>{chat.unixTime}</TableCell>
																<TableCell>{chat.who}</TableCell>
																<TableCell>{chat.chatText}</TableCell>
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
					<Button type="submit" className="w-48" size={"lg"}>
						送信
					</Button>
				</form>
			</Form>
			<Toaster />
		</div>
	);
}

export default App;
