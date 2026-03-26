
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, Plus, Trash2, Edit2, AlertCircle, 
  CheckCircle2, Search, Filter, Camera, 
  FileText, Calendar, Tag, Info, Loader2,
  ExternalLink, ChevronRight, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDate, formatFCFA } from '@/lib/format';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PropertyFurnitureProps {
  propertyId: number;
}

const CATEGORIES = [
  { value: 'CUISINE', label: 'Cuisine', icon: '🍳' },
  { value: 'CHAMBRE', label: 'Chambre', icon: '🛏️' },
  { value: 'SALON', label: 'Salon', icon: '🛋️' },
  { value: 'EQUIPEMENT', label: 'Équipement', icon: '🔌' },
];

const CONDITIONS = [
  { value: 'GOOD', label: 'Bon état', color: 'bg-indigo-500' },
  { value: 'BROKEN', label: 'À vérifier', color: 'bg-rose-500' },
];

export function PropertyFurniture({ propertyId }: PropertyFurnitureProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');

  // Queries
  const { data: furnitures, isLoading } = useQuery({
    queryKey: ['furniture', propertyId],
    queryFn: () => api.get(`/immobilier/biens/${propertyId}/meubles/`).then(res => res.data)
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/immobilier/biens/${propertyId}/meubles/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['furniture', propertyId] });
      setIsAddModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/immobilier/biens/${propertyId}/meubles/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['furniture', propertyId] });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    createMutation.mutate(data);
  };

  const filteredFurniture = furnitures?.filter((f: any) => {
    return filter === 'ALL' || f.category === filter;
  });

  if (isLoading) return <div className="animate-pulse h-20 bg-slate-100 rounded-3xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Mobilier
          <Badge className="bg-slate-100 text-slate-500 border-none px-2 rounded-full text-[10px] font-bold">
            {furnitures?.length || 0}
          </Badge>
        </h3>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest h-10 px-4">
              <Plus className="h-3 w-3 mr-2" /> Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-3xl border-none">
            <form onSubmit={handleSubmit} className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Nouveau meuble</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom</Label>
                  <Input name="name" required placeholder="ex: Table à manger" className="rounded-xl border-slate-100 h-11 font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catégorie</Label>
                    <Select name="category" defaultValue="EQUIPEMENT">
                      <SelectTrigger className="rounded-xl border-slate-100 h-11 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value} className="font-bold">{cat.icon} {cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">État</Label>
                    <Select name="condition" defaultValue="GOOD">
                      <SelectTrigger className="rounded-xl border-slate-100 h-11 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        {CONDITIONS.map(cond => (
                          <SelectItem key={cond.value} value={cond.value} className="font-bold">{cond.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-xl bg-slate-900 text-white font-black h-12 shadow-xl">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-slate-50/50 rounded-[2rem] p-6">
        <div className="space-y-3">
          {filteredFurniture?.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg">
                  {CATEGORIES.find(c => c.value === item.category)?.icon || '📦'}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {CONDITIONS.find(c => c.value === item.condition)?.label}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteMutation.mutate(item.id)}
                className="h-8 w-8 rounded-full text-slate-300 hover:text-rose-500 group-hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {(!furnitures || furnitures.length === 0) && (
            <div className="py-8 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun meuble répertorié</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
