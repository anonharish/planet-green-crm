import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import type { Customer, UpdateCustomerRequest } from '../types';

const editCustomerSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email_address: z.string().email('Valid email is required'),
  occupation: z.string().optional(),
  city: z.string().optional(),
});

type EditCustomerFormValues = z.infer<typeof editCustomerSchema>;

interface EditCustomerFormProps {
  customer: Customer | null;
  onSubmit: (data: UpdateCustomerRequest) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

export const EditCustomerForm = ({
  customer,
  onSubmit,
  isLoading,
  onCancel,
}: EditCustomerFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCustomerFormValues>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email_address: '',
      occupation: '',
      city: '',
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email_address: customer.email_address || '',
        occupation: customer.occupation || '',
        city: customer.city || '',
      });
    }
  }, [customer, reset]);

  const handleFormSubmit = async (data: EditCustomerFormValues) => {
    if (!customer) return;
    await onSubmit({
      ...data,
      uuid: customer.uuid,
    });
  };

  return (
    <form id="edit-customer-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-6">
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name *</Label>
        <Input id="first_name" disabled={isLoading} {...register('first_name')} className={errors.first_name ? 'border-red-500' : ''} />
        {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name *</Label>
        <Input id="last_name" disabled={isLoading} {...register('last_name')} className={errors.last_name ? 'border-red-500' : ''} />
        {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_address">Email Address *</Label>
        <Input id="email_address" type="email" disabled={isLoading} {...register('email_address')} className={errors.email_address ? 'border-red-500' : ''} />
        {errors.email_address && <p className="text-xs text-red-500">{errors.email_address.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupation">Occupation</Label>
        <Input id="occupation" disabled={isLoading} {...register('occupation')} className={errors.occupation ? 'border-red-500' : ''} />
        {errors.occupation && <p className="text-xs text-red-500">{errors.occupation.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" disabled={isLoading} {...register('city')} className={errors.city ? 'border-red-500' : ''} />
        {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
      </div>

      <div className="pt-4 flex items-center justify-end gap-3 bottom-0 mt-auto">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Customer
        </Button>
      </div>
    </form>
  );
};
