"use client";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const emailFormSchema = z.object({
	name: z
		.string()
		.min(1, "Введите название сервера")
		.max(100, "Название слишком длинное"),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

interface EmailFormProps {
	onSubmit: (data: EmailFormValues) => void;
	isSubmitting?: boolean;
}

export function EmailForm({ onSubmit }: EmailFormProps) {
	const form = useForm<EmailFormValues>({
		resolver: zodResolver(emailFormSchema),
		defaultValues: {
			name: "",
		},
	});

	function handleSubmit(data: EmailFormValues) {
		onSubmit(data);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Название почтового сервера</FormLabel>
							<FormControl>
								<Input placeholder="Название сервера" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full" disabled>
					Создать почтовый сервер (временно недоступно)
				</Button>
			</form>
		</Form>
	);
}
