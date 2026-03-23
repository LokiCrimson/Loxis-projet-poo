import { useQuery } from '@tanstack/react-query';
import { getComptaResume, getComptaMensuel, getComptaParBien } from '@/services/comptabilite.service';

export const useComptaResume = () =>
  useQuery({ queryKey: ['compta-resume'], queryFn: () => getComptaResume().then(r => r.data) });

export const useComptaMensuel = () =>
  useQuery({ queryKey: ['compta-mensuel'], queryFn: () => getComptaMensuel().then(r => r.data) });

export const useComptaParBien = () =>
  useQuery({ queryKey: ['compta-par-bien'], queryFn: () => getComptaParBien().then(r => r.data) });
