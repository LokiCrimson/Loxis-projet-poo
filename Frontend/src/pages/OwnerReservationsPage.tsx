import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReservations, Reservation, RentalMessage, sendMessage, getMessages, updateReservationStatus, acceptReservation } from '@/services/reservations.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Home, Calendar, Send, User, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const OwnerReservationsPage = () => {
    const [requests, setRequests] = useState<Reservation[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<Reservation | null>(null);
    const [messages, setMessages] = useState<RentalMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await getReservations();
            setRequests(data);
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de charger les demandes de réservation.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRequest = async (req: Reservation) => {
        setMessages([]); // On vide avant de charger
        setSelectedRequest(req);
        try {
            const msgs = await getMessages(req.id);
            setMessages(msgs);
            
            // Auto-scroll après chargement
            const container = document.getElementById('chat-container');
            if (container) {
                setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                }, 100);
            }
        } catch (error) {
            console.error("Erreur chargement messages", error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest || !newMessage.trim()) return;

        try {
            const response = await sendMessage(selectedRequest.id, newMessage);
            // On s'assure d'ajouter le message renvoyé par l'API
            const sent = response.data;
            setMessages(prev => [...prev, sent]);
            setNewMessage('');
            
            // Auto-scroll
            const chatContainer = document.getElementById('chat-container');
            if (chatContainer) {
                setTimeout(() => {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }, 100);
            }
        } catch (error) {
            toast({ title: "Erreur", description: "Envoi du message échoué.", variant: "destructive" });
        }
    };

    const handleUpdateStatus = async (status: 'ACCEPTED' | 'REJECTED') => {
        if (!selectedRequest) return;
        try {
            if (status === 'ACCEPTED') {
                const result = await acceptReservation(selectedRequest.id);
                toast({ 
                    title: "Réservation acceptée",
                    description: result.message || `La demande a été acceptée avec succès.`
                });
                if (result.lease_data) {
                    navigate('/baux', { state: { prefill: result.lease_data } });
                } else {
                    loadRequests();
                    setSelectedRequest({ ...selectedRequest, status });
                }
            } else {
                await updateReservationStatus(selectedRequest.id, status);
                toast({ 
                    title: "Réservation refusée",
                    description: `La demande a été refusée.`
                });
                loadRequests();
                setSelectedRequest({ ...selectedRequest, status });
            }
        } catch (error) {
            toast({ title: "Erreur", description: "Mise à jour du statut échouée.", variant: "destructive" });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="secondary">En attente</Badge>;
            case 'ACCEPTED': return <Badge className="bg-green-500">Acceptée</Badge>;
            case 'REJECTED': return <Badge variant="destructive">Refusée</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground font-bold">Chargement des demandes de réservation...</div>;

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Demandes de Réservation</h1>
                <p className="text-slate-500 font-medium">Gérez les demandes de vos futurs locataires et discutez avec eux.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Liste des demandes */}
                <div className="lg:col-span-1 space-y-4">
                    {requests.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] text-center border-2 border-dashed">
                             <p className="text-muted-foreground font-bold">Aucune demande reçue.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map(req => (
                                <Card 
                                    key={req.id} 
                                    className={cn(
                                        "cursor-pointer transition-all border-none shadow-sm hover:shadow-md rounded-[1.5rem] overflow-hidden bg-white dark:bg-slate-900",
                                        selectedRequest?.id === req.id ? "ring-2 ring-primary bg-primary/5" : ""
                                    )}
                                    onClick={() => handleSelectRequest(req)}
                                >
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-sm font-black">
                                                {req.property_details?.reference || `Bien #${req.property}`}
                                            </CardTitle>
                                            {getStatusBadge(req.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-xs space-y-2">
                                        <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                                            <User className="w-3.5 h-3.5 text-primary" /> {req.tenant_name || 'Locataire inconnu'}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" /> {format(new Date(req.created_at), 'dd MMM yyyy', { locale: fr })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Détails et Messagerie */}
                <div className="lg:col-span-2">
                    {selectedRequest ? (
                        <div className="space-y-6">
                            {/* Actions de statut si en attente */}
                            {selectedRequest.status === 'PENDING' && (
                                <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-[1.5rem] border border-primary/10">
                                    <p className="text-sm font-black flex-1">Souhaitez-vous accepter cette demande ?</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus('REJECTED')}>
                                            <XCircle className="w-4 h-4 mr-2" /> Refuser
                                        </Button>
                                        <Button size="sm" className="rounded-xl" onClick={() => handleUpdateStatus('ACCEPTED')}>
                                            <CheckCircle className="w-4 h-4 mr-2" /> Accepter
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                                <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
                                    <CardTitle className="flex items-center gap-3 text-xl font-black">
                                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        Discussion avec {selectedRequest.tenant_name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div id="chat-container" className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2rem] p-6 h-[500px] overflow-y-auto mb-6 border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                                        {/* Message initial du locataire */}
                                        <div className="self-start max-w-[85%] bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] rounded-tl-none border shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5">Information Demande</Badge>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed italic">"{selectedRequest.message || "Bonjour, je suis intéressé par votre bien."}"</p>
                                            <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-4">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Début : <span className="text-slate-900 dark:text-white ml-1">{selectedRequest.proposed_start_date ? format(new Date(selectedRequest.proposed_start_date), 'dd/MM/yyyy') : 'N/A'}</span>
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Fin : <span className="text-slate-900 dark:text-white ml-1">{selectedRequest.proposed_end_date ? format(new Date(selectedRequest.proposed_end_date), 'dd/MM/yyyy') : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {messages.map((msg) => (
                                            <div 
                                                key={msg.id} 
                                                className={cn(
                                                    "max-w-[80%] p-4 rounded-[1.5rem] shadow-sm border",
                                                    msg.is_me 
                                                        ? "self-end bg-primary text-white border-primary rounded-tr-none shadow-primary/20" 
                                                        : "self-start bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-tl-none"
                                                )}
                                            >
                                                {!msg.is_me && <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{selectedRequest.tenant_name}</p>}
                                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                <p className={cn(
                                                    "text-[10px] mt-2 font-bold opacity-60",
                                                    msg.is_me ? "text-white/80" : "text-slate-400"
                                                )}>
                                                    {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <form onSubmit={handleSendMessage} className="flex gap-3">
                                        <Input 
                                            placeholder="Répondez au locataire..." 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="h-14 px-6 rounded-2xl border-slate-200 focus-visible:ring-primary/20 font-medium"
                                        />
                                        <Button type="submit" size="icon" className="h-14 w-14 rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                                            <Send className="w-5 h-5" />
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-12">
                            <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-6">
                                <MessageSquare className="w-12 h-12 text-primary/40" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sélectionnez une demande</h3>
                            <p className="text-slate-500 max-w-xs font-medium">Choisissez un locataire dans la liste de gauche pour entamer la discussion ou gérer sa réservation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerReservationsPage;