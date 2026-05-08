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
  "title": "EETEPA NetLab Subnet Trainer",
  "type": "subnet",
  "deploy": true,
  "description": "Visual CIDR, VLSM, VLAN, and IP addressing trainer inspired by EETEPA Vilhena Alves networking classes.",
  "tagline": "Visual CIDR, VLSM, VLAN, and IP addressing trainer for technical networking classes.",
  "accent": "#256f6b",
  "secondary": "#9a6b2f",
  "topics": [
    "eetepa",
    "networking",
    "subnetting",
    "cidr",
    "education-technology",
    "react",
    "typescript"
  ]
};
