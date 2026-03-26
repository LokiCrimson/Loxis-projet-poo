import React, { useState } from 'react';
import { 
  Building2, Search, Filter, MapPin, Maximize2, 
  DoorOpen, Bookmark, Calendar, Star, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePublicBiens, useReservations, useCreateReservation } from '@/hooks/use-reservations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatFCFA } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { format } from 'date-fns';

const Carousel = ({ images }: { images: any[] }) => {
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-slate-100 text-slate-400">
        <Building2 className="h-12 w-12" />
      </div>
    );
  }
  return (
    <div className="relative aspect-video overflow-hidden rounded-t-xl">
      <img src={images[0].image} alt="Bien" className="h-full w-full object-cover" />
    </div>
  );
};

export default function ExplorerBiensPage() {
  const navigate = useNavigate();
  const { data: biens, isLoading } = usePublicBiens();
  const { data: myReservations } = useReservations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBien, setSelectedBien] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const createMutation = useCreateReservation();

  const handleReserve = () => {
    if (selectedBien) {
      createMutation.mutate({ 
          property: selectedBien.id, 
          message,
          proposed_start_date: format(new Date(), 'yyyy-MM-dd'),
          proposed_end_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd')
      }, {
        onSuccess: () => {
          setSelectedBien(null);
          setMessage('');
          navigate('/mes-locations');
        }
      });
    }
  };

  const filteredBiens = (biens || []).filter(b => 
    b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReservationStatus = (id: number) => {
    return myReservations?.find(r => r.property === id)?.status;
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Catalogue Immobilier</h1>
        <p className="text-muted-foreground font-medium">Découvrez tous les biens disponibles à la location.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Rechercher une ville, une adresse..." 
          className="pl-10 h-12 rounded-xl"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredBiens.length === 0 ? (
        <EmptyState title="Aucun bien disponible" description="Revenez plus tard !" icon={Building2} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBiens.map((bien) => {
            const status = getReservationStatus(bien.id);
            return (
              <Card key={bien.id} className="border-none shadow-xl rounded-[2rem] overflow-hidden group">
                <Carousel images={bien.photos || []} />
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold text-[10px] rounded-lg">
                      {bien.category_name}
                    </Badge>
                    <span className="font-black text-indigo-600">
                      {formatFCFA(bien.base_rent_hc)}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-black">{bien.reference}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {bien.city}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate(`/reserver/${bien.id}`)}>
                    Détails
                  </Button>
                  {status ? (
                    <Badge className="flex-1 h-10 justify-center bg-indigo-50 text-indigo-600 border-none">
                      {status === 'PENDING' ? 'En attente' : 'Déjà demandé'}
                    </Badge>
                  ) : (
                    <Button className="flex-1 rounded-xl bg-slate-900" onClick={() => setSelectedBien(bien)}>
                      Réserver
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de demande */}
      <Dialog open={!!selectedBien} onOpenChange={() => setSelectedBien(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Réserver {selectedBien?.reference}</DialogTitle>
          </DialogHeader>
          <Textarea 
            placeholder="Message au propriétaire..." 
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button onClick={handleReserve} className="rounded-xl w-full bg-indigo-600">
              {createMutation.isPending ? "Envoi..." : "Confirmer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
