"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Loader } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid GitHub repository URL.' }).refine(
    (url) => url.startsWith('https://github.com/'),
    'Please enter a valid GitHub repository URL.'
  ),
});

interface RepoFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function RepoForm({ onSubmit, isLoading }: RepoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: 'https://github.com/facebook/react',
    },
  });

  function onFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values.url);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="flex w-full items-start gap-2">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g., https://github.com/facebook/react" 
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-[120px]">
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            'Visualize'
          )}
        </Button>
      </form>
    </Form>
  );
}
