import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChatTable } from "./Chat_table";
import { Controller } from "./Controller";
import { Setting } from "./Setting";
import { Button } from "./components/ui/button";
import { Drawer, DrawerTrigger } from "./components/ui/drawer";
import { Form } from "./components/ui/form";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import { SocketControler, type socketServerChatType } from "./lib/socket";
import { Recognition } from "./lib/speechrecognition";

export const formSchema = z.object({
	type: z.enum(["talk", "work_theme", "afk", "back", "grade"]).default("talk"),
	unixTime: z.string().default(""),
	needScreenshot: z.boolean().default(false),
});

function App() {
	const [chats, setChats] = useState<socketServerChatType[]>([]);
	const [recognition] = useState<Recognition>(Recognition.instance);
	const [socket] = useState<SocketControler>(SocketControler.instance);
	const listEndRef = useRef<HTMLTableRowElement>(null);
	const { toast } = useToast();

	useEffect(() => {
		const recognitionRemove = recognition.setEvent((eventName, content) => {
			socket.sendEvent(eventName, content);
		});
		const removeWatchChat = socket.watchChat((chat) => {
			setChats((prev) => [...prev, chat]);
			listEndRef.current?.scrollIntoView({ behavior: "smooth" });
			console.log("chats", chats);
		});

		return () => {
			recognitionRemove();
			removeWatchChat();
		};
	}, [chats, recognition, socket]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		console.log("submit");
		toast({
			title: "AIに送信しました",
		});
		socket.sendEvent(
			"instruction",
			JSON.stringify({
				type: data.type,
				unixTime: data.unixTime,
				needScreenshot: data.needScreenshot,
			}),
		);
		form.setValue("needScreenshot", false);
		form.setValue("type", "talk");
		form.setValue("unixTime", "");
	};

	return (
		<Drawer>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-6 items-center"
				>
					<ChatTable
						chats={chats}
						form={form}
						onSubmit={onSubmit}
						listEndRef={listEndRef}
					/>
					<Controller form={form} />
					<Button type="submit" className="w-48" size={"lg"}>
						送信
					</Button>
				</form>
			</Form>
			<DrawerTrigger asChild className="ms-5">
				<Button variant="outline">設定を開く</Button>
			</DrawerTrigger>
			<Toaster />
			<Setting socket={socket} />
		</Drawer>
	);
}

export default App;
