import { useCallback } from 'react';

import { getErrorMessage } from '@/core/api';
import { log } from '@/core/log';
import { useAction, useRequest } from '@/core/request';
import { toast } from '@/shared/utils/toast';

import { historyApi } from '../api/history.api';
import { INVOICE_COPY } from '../constants/history.constants';
import { invoiceFileName } from '../utils/history';
import { sharePdf } from '../utils/share';

// The receipt for one session, and its PDF: downloaded into the app's documents, then handed to
// the share sheet so the driver can save it to Files / Downloads or send it.
export const useInvoice = (id: string) => {
  const load = useCallback(() => historyApi.getInvoice(id), [id]);
  const request = useRequest(load);
  const download = useAction(historyApi.downloadInvoicePdf);
  const invoice = request.data ?? null;

  const save = async () => {
    if (!invoice || download.isPending) return;

    let uri: string;
    try {
      uri = await download.run(invoice.id, invoiceFileName(invoice.transactionId, invoice.id));
    } catch (error) {
      log.warn('invoice download failed', { error: String(error) });
      toast.error(INVOICE_COPY.downloadError);
      return;
    }

    const shared = await sharePdf(uri, INVOICE_COPY.pdfTitle);
    if (shared === 'unavailable') toast.info(INVOICE_COPY.needsUpdate);
    else toast.success(INVOICE_COPY.downloaded);
  };

  return {
    invoice,
    loading: !invoice && request.loading,
    failed: !invoice && !request.loading && !!request.error,
    errorMessage: getErrorMessage(request.error),
    retry: () => void request.refetch(),
    canDownload: invoice?.status === 'completed' || invoice?.status === null,
    downloading: download.isPending,
    download: () => void save(),
  };
};
