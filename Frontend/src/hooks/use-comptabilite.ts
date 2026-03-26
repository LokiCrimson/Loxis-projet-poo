import { useQuery } from '@tanstack/react-query';
import { getComptaResume, getComptaMensuel, getComptaParBien } from '@/services/comptabilite.service';

export const useComptaResume = (year?: number) =>
  useQuery({ queryKey: ['compta-resume', year], queryFn: () => getComptaResume(year).then(r => r.data) });

export const useComptaMensuel = (year?: number) =>
  useQuery({ queryKey: ['compta-mensuel', year], queryFn: () => getComptaMensuel(year).then(r => r.data) });

export const useComptaParBien = (year?: number) =>
  useQuery({ queryKey: ['compta-par-bien', year], queryFn: () => getComptaParBien(year).then(r => r.data) });
