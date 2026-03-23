import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../../../components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { cn } from '../../../utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useGetAllUsersByRoleIdQuery } from '../api/usersApi';

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  login_id: z.string().optional(),
  password: z.string().optional(),
  role_id: z.number(),
  reporting_manager_id: z.number().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
  initialValues?: Partial<FormValues>;
  isEdit?: boolean;
  roleId: number;
  roleLabel: string;
}

export const UserForm = ({ 
  onSubmit, 
  isLoading, 
  initialValues,
  isEdit = false,
  roleId,
  roleLabel
}: UserFormProps) => {
  const [open, setOpen] = useState(false);

  // Fetch all Relationship Managers (Role ID 3) for the reporting manager dropdown
  const { data: managers = [] } = useGetAllUsersByRoleIdQuery({ role_id: 3, offset: 0 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialValues?.first_name || '',
      last_name: initialValues?.last_name || '',
      phone_number: initialValues?.phone_number || '',
      email: initialValues?.email || '',
      login_id: initialValues?.login_id || '',
      password: initialValues?.password || '',
      role_id: initialValues?.role_id || roleId,
      reporting_manager_id: initialValues?.reporting_manager_id || null,
    },
  });

  const handleInternalSubmit = (values: FormValues) => {
    // Automatically set login_id to email
    const payload = {
      ...values,
      login_id: values.email,
      role_id: roleId 
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleInternalSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email eg:hello@gmail.com" type="email" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEdit && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temporary Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter password" type="password" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select 
                onValueChange={(v) => field.onChange(Number(v))} 
                value={String(field.value)}
                disabled
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={String(roleId)}>{roleLabel}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reporting Manager Dropdown (Only for Experience Managers/Agents) */}
        {roleId === 4 && (
          <FormField
            control={form.control}
            name="reporting_manager_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Reporting Manager</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          "w-full justify-between font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value
                          ? `${managers.find((m) => m.id === field.value)?.first_name} ${managers.find((m) => m.id === field.value)?.last_name}`
                          : "Select relationship manager"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search managers..." />
                      <CommandEmpty>No manager found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {managers.map((manager) => (
                          <CommandItem
                            key={manager.id}
                            value={`${manager.first_name} ${manager.last_name}`}
                            onSelect={() => {
                              field.onChange(manager.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                manager.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {manager.first_name} {manager.last_name} ({manager.email})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading 
              ? (isEdit ? 'Updating...' : 'Creating...') 
              : (isEdit ? `Update ${roleLabel}` : `Create ${roleLabel}`)
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};
