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
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useGetAllUsersQuery, useGetAllUsersByRoleIdQuery, useGetReporteesQuery } from '../../users/api/usersApi';
import { useAppSelector } from '../../../app/hooks';
import type { CreateLeadRequest } from '../types';

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  email_address: z.string().email('Invalid email address').optional().or(z.literal('')),
  source_type: z.string().min(1, 'Source is required'), // UI-only
  source_employee_user_id: z.number().nullable().optional(),
  project_selection: z.string().min(1, 'Project is required'), // UI-only
  assigned_to_rm: z.number().nullable().optional(),
  assigned_to_em: z.number().nullable().optional(),
  occupation: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  zip: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  onSubmit: (values: CreateLeadRequest) => void;
  isLoading?: boolean;
  initialValues?: any;
  isEdit?: boolean;
}

export const LeadForm = ({ 
  onSubmit, 
  isLoading, 
  initialValues,
  isEdit = false 
}: LeadFormProps) => {
  const [sourceOpen, setSourceOpen] = useState(false);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  // Fetch all users for source autocomplete
  const { data: allUsers = [], isLoading: isLoadingUsers } = useGetAllUsersQuery({ offset: 0 });
  
  // Fetch Managers/Agents for assignment dropdowns
  const { data: managers = [] } = useGetAllUsersByRoleIdQuery({ role_id: 3, offset: 0 });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialValues?.first_name || '',
      last_name: initialValues?.last_name || '',
      phone_number: initialValues?.phone_number || '',
      email_address: initialValues?.email_address || '',
      source_type: initialValues?.source_employee_user_id ? 'internal' : (initialValues?.source_id === 1 ? 'facebook' : 'internal'),
      source_employee_user_id: initialValues?.source_employee_user_id || (isEdit ? null : Number(currentUser?.id)),
      project_selection: initialValues?.project_id === 1 ? 'dates_county' : 'planet_green',
      assigned_to_rm: initialValues?.assigned_to_rm || null,
      assigned_to_em: initialValues?.assigned_to_em || null,
      occupation: initialValues?.occupation || '',
      address: initialValues?.address || '',
      city: initialValues?.city || '',
      state: initialValues?.state || '',
      country: initialValues?.country || '',
      zip: initialValues?.zip || '',
    },
  });

  const sourceType = form.watch('source_type');
  const selectedRmId = form.watch('assigned_to_rm');

  // Fetch reportees (EMs) for the selected RM
  const { data: reportees = [], isLoading: isLoadingReportees } = useGetReporteesQuery(
    { reporting_manager_id: selectedRmId as number, offset: 0 },
    { skip: !selectedRmId }
  );

  // Reset EM when RM changes (unless it's the initial edit selection)
  const isFirstRender = React.useRef(true);
  const initialRmId = React.useRef(initialValues?.assigned_to_rm || null);
  
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Only reset if we are not on the initial load / reset to same value
    if (selectedRmId !== initialRmId.current) {
      form.setValue('assigned_to_em', null);
      // Once changed, the "initial" value is no longer relevant for reset logic
      initialRmId.current = -1; 
    }
  }, [selectedRmId, form]);

  const handleInternalSubmit = (values: FormValues) => {
    // Explicitly exclude UI-only fields from the spread
    const { source_type, project_selection, ...rest } = values;
    
    const payload: CreateLeadRequest = {
      ...rest,
      // Source employee only if 'internal' selected
      source_employee_user_id: source_type === 'internal' ? (values.source_employee_user_id ?? null) : null,
      assigned_to_rm: values.assigned_to_rm ?? null,
      assigned_to_em: values.assigned_to_em ?? null,
      lead_status_id: initialValues?.lead_status_id || 1, // Default to NEW
      lead_priority_id: initialValues?.lead_priority_id || 1, // Default to NEW
      source_id: source_type === 'internal' ? 4 : (source_type === 'facebook' ? 2 : (source_type === 'whatsapp' ? 1 : 5)),
      project_id: project_selection === 'planet_green' ? 2 : 1,
      // Ensure all optional fields are at least empty strings for the API
      email_address: values.email_address || '',
      occupation: values.occupation || '',
      address: values.address || '',
      city: values.city || '',
      state: values.state || '',
      country: values.country || '',
      zip: values.zip || '',
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleInternalSubmit)} className="space-y-4 pb-10">
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} disabled={isLoading || isEdit} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="source_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="whatsapp">Whatsapp</SelectItem>
                    <SelectItem value="internal">Internal Employee</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="project_selection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dates_county">Dates County</SelectItem>
                    <SelectItem value="planet_green">Planet Green</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {sourceType === 'internal' && (
          <FormField
            control={form.control}
            name="source_employee_user_id"
            render={({ field }) => (
              <FormItem className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                <FormLabel>Internal Employees</FormLabel>
                <Popover open={sourceOpen} onOpenChange={setSourceOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading || isLoadingUsers}
                      >
                        {field.value
                          ? `${allUsers.find((u) => u.id === field.value)?.first_name} ${allUsers.find((u) => u.id === field.value)?.last_name}`
                          : "Select employee..."}
                        {isLoadingUsers ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search users..." />
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {allUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.first_name} ${user.last_name}`}
                            onSelect={() => {
                              field.onChange(user.id);
                              setSourceOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                user.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {user.first_name} {user.last_name} ({user.email})
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assigned_to_rm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to RM</FormLabel>
                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select RM" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {managers.map(m => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.first_name} {m.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assigned_to_em"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={cn(!selectedRmId && "text-zinc-400")}>Assign to EM</FormLabel>
                <Select 
                  onValueChange={(v) => field.onChange(Number(v))} 
                  value={field.value ? String(field.value) : undefined}
                  disabled={!selectedRmId || isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedRmId ? "Select RM first" : "Select EM"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingReportees && (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {reportees.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.first_name} {a.last_name}</SelectItem>
                    ))}
                    {!isLoadingReportees && reportees.length === 0 && (
                      <div className="p-2 text-xs text-center text-zinc-500">No reportees found</div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupation</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Software Engineer" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="State" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Country" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input placeholder="Zip" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t pb-8">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Lead' : 'Create Lead')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
