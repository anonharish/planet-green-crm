import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useGetLeadsByCustomerUuidQuery } from '../../leads/api/leadsApi';
import { useGetLeadsByRmIdQuery } from '../../leads/api/leadsApi';
import { formatDate } from '../../../utils';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';

interface CustomerLeadsDialogProps {
  open: boolean;
  onClose: () => void;

  // For customer
  customerUuid?: string | null;
  customerName?: string;

  // For RM (View Leads / EM Count click from Relationship Managers page)
  rmId?: number | null;
}

export const CustomerLeadsDialog = ({
  open,
  onClose,
  customerUuid,
  customerName,
  rmId,
}: CustomerLeadsDialogProps) => {
  const navigate = useNavigate();
  const { getStatusLabel, getSourceLabel } = useMasterDataLookup();

  // Customer leads query
  const customerQuery = useGetLeadsByCustomerUuidQuery(
    { customer_uuid: customerUuid || '', offset: 0 },
    { skip: !customerUuid || !!rmId || !open }
  );

  // RM leads query
  const rmQuery = useGetLeadsByRmIdQuery(
    {
      assigned_to_rm: rmId || 0,
      offset: 0,
      is_em_assigned: 1,
    },
    { skip: !rmId || !open }
  );

  // Choose active query based on context
  const data = rmId ? rmQuery.data : customerQuery.data;
  const isLoading = rmId ? rmQuery.isLoading : customerQuery.isLoading;
  const isError = rmId ? rmQuery.isError : customerQuery.isError;

  const leads = data || [];

  // ✅ Dialog title: show RM name when coming from RM page, else show customer name
  const dialogTitle = customerName
    ? `Lead Registry`
    : 'Lead Registry';

  const dialogSubtitle = customerName
    ? `Listing leads for ${customerName}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogSubtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {dialogSubtitle}
            </p>
          )}
        </DialogHeader>

        <div className="p-6 overflow-y-auto min-h-0 flex-1 bg-zinc-50/30 dark:bg-zinc-950">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Fetching leads...</p>
            </div>
          )}

          {isError && (
            <div className="text-center text-red-500 py-12">
              Failed to load leads.
            </div>
          )}

          {!isLoading && !isError && leads.length === 0 && (
            <div className="text-center text-zinc-500 py-12 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 border-dashed">
              No leads found.
            </div>
          )}

          {!isLoading && !isError && leads.length > 0 && (
            <div className="flex flex-col gap-4">
              {leads.map((lead) => (
                <div
                  key={lead.uuid}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                        {lead.lead_id || 'Unknown ID'}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-2 font-bold uppercase bg-zinc-50 dark:bg-zinc-800"
                      >
                        {getStatusLabel(lead.lead_status_id)}
                      </Badge>
                    </div>

                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {lead.first_name || ''} {lead.last_name || ''}
                    </h4>

                    <div className="text-sm text-zinc-600 dark:text-zinc-400 flex flex-col gap-1">
                      <span>
                        <strong>Created:</strong> {formatDate(lead.created_on)}
                      </span>
                      <span>
                        <strong>Source:</strong> {getSourceLabel(lead.source_id)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="shrink-0 gap-2 w-full sm:w-auto"
                    onClick={() =>
                      navigate(`/leads/${lead.uuid}`, {
                        state: { fromCustomer: true },
                      })
                    }
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};