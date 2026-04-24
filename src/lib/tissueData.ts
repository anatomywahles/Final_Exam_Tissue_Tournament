// Tissue categories and strata definitions
export interface Tissue {
  name: string;
  category: 'epithelial' | 'connective' | 'muscle' | 'nervous';
  stratum: string;
}

export const tissueStrata: Record<string, { tissues: string[]; draw: number; category: 'epithelial' | 'connective' | 'muscle' | 'nervous' }> = {
  'Simple epithelium': {
    tissues: ['Simple squamous epithelium', 'Simple cuboidal epithelium'],
    draw: 2,
    category: 'epithelial'
  },
  'Columnar epithelium': {
    tissues: ['Non-ciliated simple columnar epithelium', 'Ciliated simple columnar epithelium', 'Ciliated pseudostratified columnar epithelium'],
    draw: 1,
    category: 'epithelial'
  },
  'Keratinized squamous': {
    tissues: ['Non-keratinized stratified squamous epithelium', 'Keratinized stratified squamous epithelium'],
    draw: 1,
    category: 'epithelial'
  },
  'Stratified epithelium': {
    tissues: ['Stratified cuboidal epithelium', 'Stratified columnar epithelium', 'Transitional epithelium'],
    draw: 2,
    category: 'epithelial'
  },
  'Loose connective tissue': {
    tissues: ['Areolar loose connective tissue', 'Adipose loose connective tissue', 'Reticular loose connective tissue'],
    draw: 2,
    category: 'connective'
  },
  'Dense connective tissue': {
    tissues: ['Dense regular connective tissue', 'Dense irregular connective tissue', 'Dense elastic connective tissue'],
    draw: 1,
    category: 'connective'
  },
  'Cartilage': {
    tissues: ['Hyaline cartilage', 'Fibrocartilage', 'Elastic cartilage'],
    draw: 2,
    category: 'connective'
  },
  'Misc. Connective tissue': {
    tissues: ['Bone connective tissue', 'Blood connective tissue'],
    draw: 1,
    category: 'connective'
  },
  'Muscle tissue': {
    tissues: ['Skeletal muscle', 'Cardiac muscle', 'Smooth muscle'],
    draw: 3,
    category: 'muscle'
  },
  'Nervous': {
    tissues: ['Nervous tissue'],
    draw: 1,
    category: 'nervous'
  }
};

function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomSelect<T>(arr: T[], n: number): T[] {
  const shuffled = fisherYatesShuffle(arr);
  return shuffled.slice(0, n);
}

export function performStratifiedDraw(): Tissue[] {
  const selectedTissues: Tissue[] = [];
  
  for (const [stratum, data] of Object.entries(tissueStrata)) {
    const drawn = randomSelect(data.tissues, data.draw);
    drawn.forEach(name => {
      selectedTissues.push({
        name,
        category: data.category,
        stratum
      });
    });
  }
  
  let finalTissues = fisherYatesShuffle(selectedTissues);
  finalTissues = fisherYatesShuffle(finalTissues);
  
  return finalTissues;
}

export function getTissueCategoryColor(category: string): { bg: string; border: string; text: string } {
  switch (category) {
    case 'epithelial':
      return { bg: '#d8b4fe', border: '#a855f7', text: '#581c87' };
    case 'connective':
      return { bg: '#fed7aa', border: '#f97316', text: '#7c2d12' };
    case 'muscle':
      return { bg: '#fecaca', border: '#ef4444', text: '#7f1d1d' };
    case 'nervous':
      return { bg: '#a5f3fc', border: '#06b6d4', text: '#164e63' };
    default:
      return { bg: '#e5e7eb', border: '#9ca3af', text: '#374151' };
  }
}
