import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, FileDown, History, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

export interface Payment {
    id: number;
    reference: string;
    date_paiement: string;
    montant_paye: string;
    montant_attendu: string;
    statut: string;
    bien_reference?: string;
}

const PaymentsPage = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

            useEffect(() => {
        const fetchPayments = async () => {
            try {
                // On utilise le bon endpoint défini dans finances/urls.py
                const { data } = await api.get('/finances/paiements/');
                setPayments(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Erreur paiements", error);
                setPayments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(String(p.montant_paye || 0)), 0);

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mes Paiements et Quittances</h1>
                    <p className="text-muted-foreground mt-1">Historique complet de vos loyers réglés en espèces et validés par le bailleur.</p>
                </div>
                <Card className="shadow-sm border-primary/20 bg-primary/5">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-semibold text-muted-foreground">Total loyers versés</p>
                            <p className="text-xl font-bold">{totalPaid.toLocaleString()} FCFA</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" /> Historique des règlements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground">Recherche des quittances...</div>
                    ) : payments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date de paiement</TableHead>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Bien</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead className="text-right">Quittance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment: any) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">
                                                {payment.date_paiement ? format(new Date(payment.date_paiement), 'dd/MM/yyyy') : '-'}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-mono">
                                                {payment.reference || `#${String(payment.id).slice(0, 8)}`}
                                            </TableCell>
                                            <TableCell>{payment.bien_reference}</TableCell>
                                            <TableCell className="font-bold">
                                                {parseFloat(String(payment.montant_paye)).toLocaleString()} FCFA
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-8 group"
                                                    onClick={async () => {
                                                        try {
                                                            // On demande l'URL PDF avec le token JWT
                                                            const response = await api.get(`/finances/paiements/${payment.id}/quittance/`, {
                                                                responseType: 'blob'
                                                            });
                                                            
                                                            // On crée un lien temporaire pour déclencher le téléchargement du blob
                                                            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', `Quittance_${payment.reference || payment.id}.pdf`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                            window.URL.revokeObjectURL(url);
                                                        } catch (err) {
                                                            console.error("Erreur téléchargement", err);
                                                        }
                                                    }}
                                                >
                                                    <FileDown className="w-4 h-4 mr-2 group-hover:text-primary" /> Quittance
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="p-12 text-center border rounded-xl bg-slate-50">
                            <FileDown className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-muted-foreground font-medium">Aucun paiement enregistré pour l'instant.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentsPage;
