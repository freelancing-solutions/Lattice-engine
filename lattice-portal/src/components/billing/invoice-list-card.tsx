/**
 * Invoice List Card
 *
 * A component for displaying and managing invoice history with download
 * functionality and status tracking.
 */

import { Download, Receipt, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Invoice } from '@/types';
import { useState } from 'react';

interface InvoiceListCardProps {
  invoices: Invoice[];
  onDownload: (invoiceId: string) => Promise<string>;
  isLoading?: boolean;
}

export function InvoiceListCard({
  invoices,
  onDownload,
  isLoading = false,
}: InvoiceListCardProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Paid
          </Badge>
        );
      case 'open':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Failed
            </Badge>
          );
      case 'void':
      case 'uncollectible':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            {status === 'void' ? 'Void' : 'Uncollectible'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
    try {
      setDownloadingId(invoiceId);
      const downloadUrl = await onDownload(invoiceId);

      // Open the download URL in a new tab
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to download invoice:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  // Sort invoices by date (most recent first)
  const sortedInvoices = [...invoices].sort((a, b) =>
    new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoices
            <Badge variant="outline" className="ml-auto">
              {invoices.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoices
            <Badge variant="outline" className="ml-auto">
              0
            </Badge>
          </CardTitle>
          <CardDescription>
            Your billing invoices will appear here once you have an active subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No invoices yet
            </h3>
            <p className="text-gray-500">
              Your subscription invoices will appear here as they are generated.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Invoices
          <Badge variant="outline" className="ml-auto">
            {invoices.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          View and download your billing invoices. Click on an invoice to download the PDF.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.amountTotal, invoice.currency)}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(invoice.id, invoice.invoiceNumber)}
                      disabled={downloadingId === invoice.id}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {downloadingId === invoice.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination indicator for large lists */}
        {invoices.length > 10 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Showing latest {Math.min(invoices.length, 10)} of {invoices.length} invoices
            </p>
          </div>
        )}

        {/* Invoice Status Legend */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Failed</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-gray-600" />
              <span>Void/Uncollectible</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}