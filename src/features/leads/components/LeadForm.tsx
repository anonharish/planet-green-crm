import React from 'react';
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
import { Loader2, User, ClipboardList, MapPin } from 'lucide-react';
import { useGetAllUsersQuery, useGetAllUsersByRoleIdQuery, useGetReporteesQuery } from '../../users/api/usersApi';
import { usePermissions } from '../../../hooks/usePermissions';
import { useGetAllMasterDataQuery } from '../../master/api/masterApi';
import type { CreateLeadRequest } from '../types';

const formSchema = z.object({
  first_name: z.string().max(30, 'First name must be less than 30 characters').optional().or(z.literal('')),
  last_name: z.string().max(30, 'Last name must be less than 30 characters').optional().or(z.literal('')),
  phone_number: z.string().min(1, 'Mobile number is required').regex(/^[6-9]\d{9}$/, 'Mobile number must be a 10-digit number (no letters allowed)'),
  email_address: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  source_id: z.number().min(1, 'Source is required'),
  source_employee_user_id: z.number().nullable().optional(),
  project_id: z.number().min(1, 'Project is required'),
  assigned_to_rm: z.number().nullable().optional(),
  assigned_to_em: z.number().nullable().optional(),
  occupation: z.string().max(50, 'Occupation cannot exceed 50 characters').optional().or(z.literal('')),
  address: z.string().max(100, 'Address cannot exceed 100 characters').optional().or(z.literal('')),
  city: z.string().max(50, 'City cannot exceed 50 characters').optional().or(z.literal('')),
  state: z.string().max(50, 'State cannot exceed 50 characters').optional().or(z.literal('')),
  country: z.string().max(50, 'Country cannot exceed 50 characters').optional().or(z.literal('')),
  zip: z.string().max(50, 'Zip cannot exceed 50 characters').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

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
  const { user: currentUser, roleCode } = usePermissions();
  const isEM = roleCode === 'EXPMNG';
  
  const { data: masterData } = useGetAllMasterDataQuery();
  
  const { data: allUsers = [] } = useGetAllUsersQuery({ offset: 0 });
  
  const { data: managers = [] } = useGetAllUsersByRoleIdQuery({ role_id: 3, offset: 0 });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialValues?.first_name || '',
      last_name: initialValues?.last_name || '',
      phone_number: initialValues?.phone_number || '',
      email_address: initialValues?.email_address || '',
      source_id: initialValues?.source_id || undefined,
      source_employee_user_id: initialValues?.source_employee_user_id || (isEdit ? null : Number(currentUser?.id)),
      project_id: initialValues?.project_id || undefined,
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

  const sourceId = form.watch('source_id');
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
    // Explicitly exclude Internal Employee logic check based on master data code
    const internalSource = masterData?.sources.find(s => s.code === 'INTERNAL' || s.description.toLowerCase().includes('internal'));
    const isInternal = values.source_id === internalSource?.id;

    const payload: CreateLeadRequest = {
      ...values,
      first_name: values.first_name || '',
      last_name: values.last_name || '',
      // Source employee only if 'internal' selected
      source_employee_user_id: isInternal ? (values.source_employee_user_id ?? null) : null,
      assigned_to_rm: values.assigned_to_rm ?? null,
      assigned_to_em: values.assigned_to_em ?? null,
      lead_status_id: initialValues?.lead_status_id || 1, // Default to NEW
      lead_priority_id: initialValues?.lead_priority_id || 1,
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
      <form onSubmit={form.handleSubmit(handleInternalSubmit)} className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10 bg-zinc-50/30 dark:bg-zinc-950/30">
          {/* Section: Personal Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <User className="h-4 w-4" />
              <h3 className="text-sm font-bold tracking-tight">Personal Details</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Jonathan" 
                        {...field} 
                        disabled={isLoading} 
                        maxLength={30}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 h-11 focus:ring-primary/20 transition-all font-medium"
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
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Wick" 
                        {...field} 
                        disabled={isLoading} 
                        maxLength={30}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 h-11 focus:ring-primary/20 transition-all font-medium"
                      />
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
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 9876543210"
                        {...field}
                        disabled={isLoading || isEdit}
                        type="tel"
                        maxLength={10}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const val = e.target.value.replace(/\D/g, '');
                          field.onChange(val);
                        }}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 h-11 focus:ring-primary/20 transition-all font-medium tracking-wider"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email_address"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="j.wick@continental.com" 
                        {...field} 
                        disabled={isLoading} 
                        type="email"
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 h-11 focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Occupation</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Consultant, Designer, etc." 
                      {...field} 
                      disabled={isLoading} 
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 h-11 focus:ring-primary/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section: Classification */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <ClipboardList className="h-4 w-4" />
              <h3 className="text-sm font-bold tracking-tight">Classification</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source_id"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Source</FormLabel>
                    <Select 
                      onValueChange={(v) => field.onChange(Number(v))} 
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-11 px-4 focus:ring-primary/20 transition-all">
                          <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {masterData?.sources.map((source) => (
                          <SelectItem key={source.id} value={String(source.id)}>
                            {source.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Project</FormLabel>
                    <Select 
                      onValueChange={(v) => field.onChange(Number(v))} 
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-11 px-4 focus:ring-primary/20 transition-all">
                          <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {masterData?.projects.map((project) => (
                          <SelectItem key={project.id} value={String(project.id)}>
                            {project.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(() => {
              const internalSource = masterData?.sources.find(s => s.code === 'INTERNAL' || s.description.toLowerCase().includes('internal'));
              return sourceId === internalSource?.id;
            })() && (
              <FormField
                control={form.control}
                name="source_employee_user_id"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Source Employee</FormLabel>
                    <Select 
                      onValueChange={(v) => field.onChange(Number(v))} 
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-11 px-4 focus:ring-primary/20 transition-all">
                          <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allUsers.map((user) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!isEM && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assigned_to_rm"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Assign to RM</FormLabel>
                      <Select 
                        onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))} 
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-11 px-4 focus:ring-primary/20 transition-all">
                            <SelectValue placeholder="Select RM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" className="text-zinc-500 italic">Unassigned</SelectItem>
                          {managers.map((manager: any) => (
                            <SelectItem key={manager.id} value={String(manager.id)}>
                              {manager.first_name} {manager.last_name}
                            </SelectItem>
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
                    <FormItem className="space-y-1.5">
                      <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Assign to EM</FormLabel>
                      <Select 
                        key={selectedRmId || 'empty-rm'}
                        onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))} 
                        value={field.value ? String(field.value) : ""}
                        disabled={!selectedRmId || isLoadingReportees}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-11 px-4 focus:ring-primary/20 transition-all">
                            <SelectValue placeholder={!selectedRmId ? "Select RM first" : "Select EM"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" className="text-zinc-500 italic">Unassigned</SelectItem>
                          {reportees.map((em: any) => (
                            <SelectItem key={em.id} value={String(em.id)}>
                              {em.first_name} {em.last_name} 
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Section: Address Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-4 w-4" />
              <h3 className="text-sm font-bold tracking-tight">Address Details</h3>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. 123 Main St" 
                      {...field} 
                      disabled={isLoading} 
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 h-11 focus:ring-primary/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Country</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Country" 
                        {...field} 
                        disabled={isLoading} 
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 h-11 focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="City" 
                        {...field} 
                        disabled={isLoading} 
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 h-11 focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">State</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value ? String(field.value) : ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-11 px-4 focus:ring-primary/20 transition-all">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="uppercase text-xs font-semibold tracking-wider text-zinc-400">Zip Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Zip" 
                        {...field} 
                        disabled={isLoading} 
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 h-11 focus:ring-primary/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-3 pb-5 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 shrink-0 sticky bottom-0 rounded-t-xl shadow-[0_-4px_20px_rgb(0,0,0,0.03)]">
          <Button type="submit" disabled={isLoading} className="w-full h-10 rounded-xl bg-[#1A4B84] hover:bg-[#143965] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              isEdit ? 'Update Lead' : 'Create Lead'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};