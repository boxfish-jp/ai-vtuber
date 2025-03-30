import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { formSchema } from "./App";
import { FormControl, FormField, FormItem } from "./components/ui/form";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { ScrollArea } from "./components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./components/ui/table";
import type { socketServerChatType } from "./lib/socket";

export const ChatTable = ({
	chats,
	form,
	onSubmit,
	listEndRef,
}: {
	chats: socketServerChatType[];
	form: UseFormReturn<z.infer<typeof formSchema>>;
	onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
	listEndRef: React.RefObject<HTMLTableRowElement>;
}) => {
	return (
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
														<RadioGroupItem value={chat.unixTime.toString()} />
													</TableCell>
													<TableCell>{chat.unixTime}</TableCell>
													<TableCell>{chat.who}</TableCell>
													<TableCell>{chat.content}</TableCell>
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
	);
};
