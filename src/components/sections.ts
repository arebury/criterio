export type Section = 'sintesis' | 'resumenes' | 'articulos' | 'debate';

export const SECTIONS: { id: Section; label: string }[] = [
  { id: 'sintesis', label: 'Síntesis' },
  { id: 'resumenes', label: 'Resúmenes' },
  { id: 'articulos', label: 'Artículos' },
  { id: 'debate', label: 'Debate' },
];
