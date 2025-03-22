import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { formSchema } from "./App";
import { FormControl, FormField, FormItem } from "./components/ui/form";
import { Label } from "./components/ui/label";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Switch } from "./components/ui/switch";
import { instructions } from "./lib/instructions";

export const Controller = ({
	form,
}: {
	form: UseFormReturn<z.infer<typeof formSchema>>;
}) => (
	<>
		<div className="flex items-center gap-2">
			<FormField
				control={form.control}
				name="needScreenshot"
				render={({ field }) => (
					<FormItem>
						<FormControl>
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						</FormControl>
					</FormItem>
				)}
			/>
			<p>スクショ</p>
		</div>
		<FormField
			control={form.control}
			name="type"
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<RadioGroup
							value={field.value}
							onValueChange={field.onChange}
							defaultValue="talk"
							className="flex gap-4"
						>
							{instructions.map((type) => (
								<div key={type}>
									<RadioGroupItem value={type} id={type} />
									<Label className="ms-1" htmlFor={type}>
										{type}
									</Label>
								</div>
							))}
						</RadioGroup>
					</FormControl>
				</FormItem>
			)}
		/>
	</>
);
