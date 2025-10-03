import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_cents: number;
  status: string;
  client_approved_at?: string;
  pdf_url?: string;
}

export default function ClientPortalView() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setError('Ongeldige toegangslink');
      setIsLoading(false);
      return;
    }

    loadInvoices();
  }, [token]);

  const loadInvoices = async () => {
    try {
      // Verify token and get client_id
      const { data: tokenData, error: tokenError } = await supabase
        .from('client_access_tokens')
        .select('client_id')
        .eq('token', token)
        .maybeSingle();

      if (tokenError) throw tokenError;
      if (!tokenData) throw new Error('Ongeldige of verlopen toegangstoken');

      // Load invoices for this client
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', tokenData.client_id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const approveInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          client_approved_at: new Date().toISOString(),
          client_approved_by: 'client',
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: 'Factuur goedgekeurd',
        description: 'De factuur is succesvol goedgekeurd.',
      });

      loadInvoices();
    } catch (err: any) {
      toast({
        title: 'Fout',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Toegang Geweigerd</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Jouw Facturen</h1>
            <p className="text-muted-foreground">Bekijk en beheer je facturen</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facturen Overzicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Geen facturen gevonden
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nummer</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Vervaldatum</TableHead>
                    <TableHead>Bedrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.issue_date), 'dd MMM yyyy', { locale: nl })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.due_date), 'dd MMM yyyy', { locale: nl })}
                      </TableCell>
                      <TableCell>€{(invoice.total_cents / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        {invoice.client_approved_at ? (
                          <Badge className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Goedgekeurd
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            In afwachting
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!invoice.client_approved_at && (
                            <Button
                              size="sm"
                              onClick={() => approveInvoice(invoice.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Goedkeuren
                            </Button>
                          )}
                          {invoice.pdf_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(invoice.pdf_url, '_blank')}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
