import React, { useState, useEffect } from 'react';
import { getReservations, Reservation, RentalMessage, sendMessage, getMessages } from '@/services/reservations.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/tooltip'; // Correction: devrais être UI card
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Home, Calendar, Send } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Note: Using standard UI components, assuming they exist in @/components/ui/
import { Card as UICard, CardContent as UICardContent, CardHeader as UICardHeader, CardTitle as UICardTitle } from '@/components/ui/card';

const MyRentalRequestsPage = () => {
    const [requests, setRequests] = useState<Reservation[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<Reservation | null>(null);
    const [messages, setMessages] = useState<RentalMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await getReservations();
            setRequests(data);
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de charger vos demandes.", variant: "destructive" });
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
            
            // Auto scroll
            const container = document.getElementById('chat-container');
            if (container) {
                setTimeout(() => container.scrollTop = container.scrollHeight, 100);
            }
        } catch (error) {
            console.error("Erreur messages", error);
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
            toast({ title: "Erreur", description: "Envoi échoué.", variant: "destructive" });
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

    if (loading) return <div className="p-8 text-center text-muted-foreground">Chargement de vos demandes...</div>;

    return (
        <div className="container mx-auto p-4 lg:p-8">
            <h1 className="text-3xl font-bold mb-8">Mes Demandes de Location</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Liste des demandes */}
                <div className="lg:col-span-1 space-y-4">
                    {requests.length === 0 ? (
                        <p className="text-muted-foreground">Aucune demande en cours.</p>
                    ) : (
                        requests.map(req => (
                            <UICard 
                                key={req.id} 
                                className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedRequest?.id === req.id ? 'border-primary' : ''}`}
                                onClick={() => handleSelectRequest(req)}
                            >
                                <UICardHeader className="p-4">
                                    <div className="flex justify-between items-start">
                                        <UICardTitle className="text-sm font-medium">
                                            {req.property_details?.reference || `Demande #${req.id}`}
                                        </UICardTitle>
                                        {getStatusBadge(req.status)}
                                    </div>
                                </UICardHeader>
                                <UICardContent className="p-4 pt-0 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Home className="w-3 h-3" /> {req.property_details?.address}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Créée le {format(new Date(req.created_at), 'dd MMMM yyyy', { locale: fr })}
                                    </div>
                                </UICardContent>
                            </UICard>
                        ))
                    )}
                </div>

                {/* Détails et Messagerie */}
                <div className="lg:col-span-2">
                    {selectedRequest ? (
                        <div className="space-y-6">
                            <UICard>
                                <UICardHeader>
                                    <UICardTitle className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-primary" />
                                        Discussion avec {selectedRequest.property_details?.owner_name || 'le Propriétaire'}
                                    </UICardTitle>
                                </UICardHeader>
                                <UICardContent>
                                    <div id="chat-container" className="bg-muted/30 rounded-lg p-4 h-[400px] overflow-y-auto mb-4 border flex flex-col gap-4">
                                        {/* Message initial de la demande */}
                                        <div className="self-start max-w-[80%] bg-background p-3 rounded-lg border shadow-sm">
                                            <p className="text-xs font-bold text-primary mb-1">Moi (Message initial)</p>
                                            <p className="text-sm italic">{selectedRequest.message || "(Pas de message)"}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                Dates : {selectedRequest.proposed_start_date || '?'} au {selectedRequest.proposed_end_date || '?'}
                                            </p>
                                        </div>

                                        {messages.map((msg) => (
                                            <div 
                                                key={msg.id} 
                                                className={`max-w-[80%] p-3 rounded-lg border shadow-sm ${msg.is_me ? 'self-end bg-primary/10 border-primary/20' : 'self-start bg-background'}`}
                                            >
                                                <p className="text-xs font-bold text-primary mb-1">{msg.is_me ? 'Moi' : (msg.sender_name || 'Propriétaire')}</p>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <Input 
                                            placeholder="Écrivez votre message..." 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <Button type="submit" size="icon">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </UICardContent>
                            </UICard>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p>Sélectionnez une demande pour voir les détails et discuter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyRentalRequestsPage;
