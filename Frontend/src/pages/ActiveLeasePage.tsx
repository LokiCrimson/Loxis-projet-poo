import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Lease } from '@/services/baux.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Home, User, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ActiveLeasePage = () => {
    const [lease, setLease] = useState<Lease | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchActiveLease = async () => {
            try {
                // Filtre sur les baux actifs du locataire connecté
                const { data } = await api.get('/baux/?statut=actif');
                if (data && data.length > 0) {
                    setLease(data[0]);
                }
            } catch (error) {
                console.error("Erreur bail actif", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveLease();
    }, []);

    if (loading) return <div className="p-8 text-center">Chargement de votre bail...</div>;

    if (!lease) {
        return (
            <div className="container mx-auto p-8 text-center">
                <div className="max-w-md mx-auto border-2 border-dashed rounded-xl p-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold mb-2">Aucun bail actif</h2>
                    <p className="text-muted-foreground">Vous n'avez pas de contrat de location en cours pour le moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Mon Bail Actif</h1>
                <Badge className="bg-green-500 px-4 py-1">En cours</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-primary" /> Détails du Logement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Référence du bien</p>
                                <p className="font-medium text-lg">{lease.bien_reference}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Adresse</p>
                                <p className="font-medium">{lease.bien_adresse}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" /> Conditions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Loyer Mensuel</p>
                            <p className="text-2xl font-bold text-primary">{parseInt(lease.loyer_actuel).toLocaleString()} FCFA</p>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Charges</span>
                            <span className="font-medium">+{parseInt(lease.charges).toLocaleString()} FCFA</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" /> Calendrier et Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Date de début</p>
                                    <p className="font-bold">{format(new Date(lease.date_debut), 'dd MMMM yyyy', { locale: fr })}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <Calendar className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Paiement dû le</p>
                                    <p className="font-bold">Chaque {lease.jour_paiement} du mois</p>
                                </div>
                            </div>
                            {lease.document_url && (
                                <Button variant="outline" className="w-full sm:w-auto mt-auto" asChild>
                                    <a href={lease.document_url} target="_blank" rel="noopener noreferrer">
                                        <FileText className="w-4 h-4 mr-2" /> Voir le contrat (PDF)
                                    </a>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ActiveLeasePage;
