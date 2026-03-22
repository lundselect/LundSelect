import { Brand, Product } from '@/types'

export const brands: Brand[] = [
  {
    id: '1', name: 'Amalfy', state: 'SP', category: 'Roupas', slug: 'amalfy',
    description: 'Nascida em São Paulo, Amalfy cria peças de alfaiataria feminina com tecidos nobres e cortes precisos. Cada coleção é pensada para a mulher que transita entre o escritório e o jantar sem perder a elegância.',
  },
  {
    id: '2', name: 'Saynalô', state: 'RJ', category: 'Roupas', slug: 'saynalo',
    description: 'Do Rio de Janeiro para o mundo, Saynalô traduz a leveza carioca em roupas com personalidade. Linho, seda e algodão orgânico são as matérias-primas favoritas da marca.',
  },
  {
    id: '3', name: 'Elis Cardim', state: 'BA', category: 'Roupas', slug: 'elis-cardim',
    description: 'Elis Cardim é a estilista baiana que reinventou a alfaiataria tropical. Inspirada no sertão e no litoral, suas peças têm textura, volume e uma paleta terrosa inconfundível.',
  },
  {
    id: '4', name: 'Morada', state: 'PB', category: 'Acessórios', slug: 'morada',
    description: 'Da Paraíba, Morada produz joias em cerâmica e metal com formas orgânicas e referências nordestinas. Cada peça é artesanal e numerada.',
  },
  {
    id: '5', name: 'Dendezeiro', state: 'BA', category: 'Roupas', slug: 'dendezeiro',
    description: 'Dendezeiro celebra a cultura afrobaiana através de bordados, estampas e silhuetas que honram a ancestralidade. Feito por mulheres, para mulheres.',
  },
  {
    id: '6', name: 'Santa Maria', state: 'RJ', category: 'Acessórios', slug: 'santa-maria',
    description: 'Acessórios finos inspirados na natureza costeira do Rio. Santa Maria trabalha com conchas, pedras semipreciosas e metais banhados a ouro para criar peças atemporais.',
  },
]

export const products: Product[] = [
  {
    id: '1',
    name: 'Vestido Linho Estruturado',
    brand: 'Amalfy',
    brandSlug: 'amalfy',
    price: 489,
    category: 'Roupas',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    slug: 'vestido-linho-estruturado',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    isNew: true,
    inStock: true,
    description: 'Vestido midi em linho italiano estruturado, com decote V e mangas 3/4. Corte levemente flared que favorece todas as silhuetas. Forro em seda natural. Feito sob medida em São Paulo.',
  },
  {
    id: '2',
    name: 'Blusa Transpassada',
    brand: 'Amalfy',
    brandSlug: 'amalfy',
    price: 279,
    category: 'Roupas',
    sizes: ['PP', 'P', 'M', 'G'],
    slug: 'blusa-transpassada',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80',
    isNew: false,
    inStock: true,
    description: 'Blusa transpassada em crepe de seda com amarração lateral ajustável. Decote assimétrico e caimento fluido. Versátil para dia e noite.',
  },
  {
    id: '3',
    name: 'Conjunto Cropped Saia',
    brand: 'Saynalô',
    brandSlug: 'saynalo',
    price: 560,
    category: 'Roupas',
    sizes: ['P', 'M', 'G', 'GG'],
    slug: 'conjunto-cropped-saia',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    isNew: true,
    inStock: true,
    description: 'Conjunto em linho lavado com cropped de alças e saia midi com fenda. A combinação perfeita para o verão carioca. Disponível em areia e branco off-white.',
  },
  {
    id: '4',
    name: 'Calça Pantalona Alfaiataria',
    brand: 'Elis Cardim',
    brandSlug: 'elis-cardim',
    price: 398,
    category: 'Roupas',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    slug: 'calca-pantalona-alfaiataria',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    isNew: false,
    inStock: true,
    description: 'Calça pantalona em tecido de alfaiataria com cintura alta e pince frontal. Caimento impecável com leveza surpreendente. Um clássico revisitado com olhar baiano.',
  },
  {
    id: '5',
    name: 'Colar Cerâmica Artesanal',
    brand: 'Morada',
    brandSlug: 'morada',
    price: 189,
    category: 'Acessórios',
    sizes: ['M'],
    slug: 'colar-ceramica-artesanal',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
    isNew: true,
    inStock: false,
    description: 'Colar em cerâmica artesanal com pingentes em formas orgânicas e cordão de couro natural. Peça única, numerada à mão pela artesã. Produzido no ateliê em João Pessoa.',
  },
  {
    id: '6',
    name: 'Vestido Bordado Dendê',
    brand: 'Dendezeiro',
    brandSlug: 'dendezeiro',
    price: 620,
    category: 'Roupas',
    sizes: ['P', 'M', 'G', 'GG'],
    slug: 'vestido-bordado-dende',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    isNew: true,
    inStock: true,
    description: 'Vestido longo em algodão com bordado manual de motivos afrobaianos. Cada bordado é único — feito por bordadeiras do Recôncavo Baiano. Uma peça que conta histórias.',
  },
  {
    id: '7',
    name: 'Brinco Concha Dourado',
    brand: 'Santa Maria',
    brandSlug: 'santa-maria',
    price: 145,
    category: 'Acessórios',
    sizes: ['M'],
    slug: 'brinco-concha-dourado',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    isNew: false,
    inStock: true,
    description: 'Brinco em concha natural com banho de ouro 18k. Design assimétrico com diferentes tamanhos de conchas. Trava de pressão segura para uso diário.',
    onSale: true,
  },
  {
    id: '8',
    name: 'Camisa Linho Oversized',
    brand: 'Saynalô',
    brandSlug: 'saynalo',
    price: 340,
    category: 'Roupas',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    slug: 'camisa-linho-oversized',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    isNew: false,
    inStock: true,
    description: 'Camisa oversized em linho puro com lavagem especial que garante maciez imediata. Botões de madrepérola e acabamento bordado no bolso. Pode ser usada aberta como sobreposição.',
  },
]

export const categories = ['Novidades', 'Roupas', 'Acessórios', 'Marcas', 'Sale']

export function getProductsByBrand(brandSlug: string): Product[] {
  return products.filter((p) => p.brandSlug === brandSlug)
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug)
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}
