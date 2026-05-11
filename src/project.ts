export type ProjectType = 'subnet' | 'packet' | 'etl' | 'serial' | 'helpdesk' | 'inventory' | 'schedule' | 'cyber';

export type ProjectConfig = {
  slug: string;
  title: string;
  type: ProjectType;
  deploy: boolean;
  description: string;
  tagline: string;
  accent: string;
  secondary: string;
  topics: string[];
};

export const project: ProjectConfig = {
  "slug": "eetepa-netlab-subnet-trainer",
  "title": "EETEPA NetLab: Treinador De Sub-redes",
  "description": "Simulador visual de CIDR, VLSM, VLANs e enderecamento IP para aulas de redes.",
  "topics": [
    "eetepa",
    "networking",
    "subnetting",
    "cidr",
    "education-technology",
    "react",
    "typescript",
    "redes",
    "sub-redes",
    "github-pages",
    "portugues-brasil",
    "educacao-tecnologica",
    "sala-de-aula"
  ],
  "deploy": true,
  "tagline": "Laboratorio visual de sub-redes para praticar enderecamento, VLANs e planejamento de hosts.",
  "type": "subnet",
  "accent": "#256f6b",
  "secondary": "#9a6b2f"
};
