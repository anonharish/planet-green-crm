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
import { Check, ChevronsUpDown, Mail, Phone as PhoneIcon, User, Lock, X } from 'lucide-react';
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
  onClose?: () => void;
}

export const UserForm = ({ 
  onSubmit, 
  isLoading, 
  initialValues,
  isEdit = false,
  roleId,
  roleLabel,
  onClose
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
      <form onSubmit={form.handleSubmit(handleInternalSubmit)} className="flex flex-col h-full overflow-hidden">
        {/* Fixed Header Section */}
        <div className="px-6 py-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-white/50 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-[24px] font-black text-[#0f3d6b] tracking-tight">
                {isEdit ? `Update ${roleLabel}` : `Create ${roleLabel}`}
              </h2>
              <p className="text-zinc-500 font-medium text-[11px]">
                {isEdit ? `Modify profile details for this ${roleLabel.toLowerCase()}.` : `Create a new profile for RM`}
              </p>
            </div>
            {onClose && (
              <button 
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body Section */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 custom-scrollbar bg-white dark:bg-zinc-950">
          {/* Section Header */}
          <div className="flex items-center gap-2.5">
             <div className="p-1.5 bg-[#0f3d6b]/5 dark:bg-zinc-900 rounded-lg text-[#0f3d6b] shadow-sm">
              <User size={16} />
            </div>
            <h3 className="text-[11px] font-black text-[#0f3d6b] dark:text-zinc-100 tracking-widest uppercase">
              Personal Details
            </h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Vikram" 
                        {...field} 
                        disabled={isLoading} 
                        className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-xl focus-visible:ring-[#0f3d6b]/10 focus-visible:border-[#0f3d6b] transition-all font-bold text-sm placeholder:text-zinc-400/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Singh" 
                        {...field} 
                        disabled={isLoading} 
                        className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-xl focus-visible:ring-[#0f3d6b]/10 focus-visible:border-[#0f3d6b] transition-all font-bold text-sm placeholder:text-zinc-400/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">Email Address</FormLabel>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-[#0f3d6b] transition-colors" />
                    <FormControl>
                      <Input 
                        placeholder="vikram.s@leados.com" 
                        type="email" 
                        {...field} 
                        disabled={isLoading} 
                        className="pl-11 h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-xl focus-visible:ring-[#0f3d6b]/10 focus-visible:border-[#0f3d6b] transition-all font-bold text-sm placeholder:text-zinc-400/40"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">Phone Number</FormLabel>
                  <div className="relative group">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-[#0f3d6b] transition-colors" />
                    <FormControl>
                      <Input 
                        placeholder="+91 98765 43210" 
                        {...field} 
                        disabled={isLoading} 
                        readOnly={isEdit}
                        className={cn(
                          "pl-11 h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-xl focus-visible:ring-[#0f3d6b]/10 focus-visible:border-[#0f3d6b] transition-all font-bold text-sm placeholder:text-zinc-400/40",
                          isEdit && "opacity-70 cursor-not-allowed select-none bg-zinc-100 dark:bg-zinc-900"
                        )}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">Temporary Password</FormLabel>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-[#0f3d6b] transition-colors" />
                      <FormControl>
                        <Input 
                          placeholder="Enter password" 
                          type="password" 
                          {...field} 
                          disabled={isLoading} 
                          className="pl-11 h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-xl focus-visible:ring-[#0f3d6b]/10 focus-visible:border-[#0f3d6b] transition-all font-bold text-sm placeholder:text-zinc-400/40"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Reporting Manager Dropdown (Only for Experience Managers/Agents) */}
            {roleId === 4 && (
              <FormField
                control={form.control}
                name="reporting_manager_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">Reporting Manager</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                              "h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 rounded-xl focus-visible:ring-[#0f3d6b]/10 focus-visible:border-[#0f3d6b] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-bold text-sm w-full justify-between shadow-none",
                              !field.value && "text-zinc-400/40"
                            )}
                            disabled={isLoading}
                          >
                            {field.value
                              ? `${managers.find((m) => m.id === field.value)?.first_name} ${managers.find((m) => m.id === field.value)?.last_name}`
                              : "Select relationship manager"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-[#0f3d6b]" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border border-zinc-100 shadow-2xl overflow-hidden" align="start">
                        <Command>
                          <CommandInput placeholder="Search managers..." className="h-12 border-none focus:ring-0 text-sm" />
                          <CommandEmpty className="py-6 text-xs text-zinc-400 text-center">No manager found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-y-auto p-2">
                            {managers.map((manager) => (
                              <CommandItem
                                key={manager.id}
                                value={`${manager.first_name} ${manager.last_name}`}
                                onSelect={() => {
                                  field.onChange(manager.id);
                                  setOpen(false);
                                }}
                                className="py-3 px-4 cursor-pointer rounded-xl hover:bg-[#0f3d6b]/5 transition-colors"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-[#0f3d6b]",
                                    manager.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-zinc-900">{manager.first_name} {manager.last_name}</span>
                                  <span className="text-[10px] text-zinc-400 font-bold">{manager.email}</span>
                                </div>
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
          </div>
        </div>

        {/* Fixed Footer Section */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-zinc-50/30 backdrop-blur-sm">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-[54px] bg-[#0f3d6b] hover:bg-[#0c3156] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#0f3d6b]/10 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading 
              ? (isEdit ? 'Updating Profile...' : 'Creating Account...') 
              : (isEdit ? `Update ${roleLabel}` : `Create ${roleLabel}`)
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};
