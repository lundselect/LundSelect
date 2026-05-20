import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guia de Tamanhos — Lund Select',
  description: 'Encontre o tamanho certo. Tabelas de medidas para roupas, calças, vestidos e acessórios.',
  alternates: { canonical: 'https://lundselect.com.br/guia-de-tamanhos' },
}

const clothingTable = {
  headers: ['Tamanho', 'Busto (cm)', 'Cintura (cm)', 'Quadril (cm)'],
  rows: [
    ['PP', '80–84', '62–66', '88–92'],
    ['P', '84–88', '66–70', '92–96'],
    ['M', '88–92', '70–74', '96–100'],
    ['G', '92–98', '74–80', '100–106'],
    ['GG', '98–104', '80–86', '106–112'],
    ['XGG', '104–110', '86–92', '112–118'],
  ],
}

const pantsTable = {
  headers: ['Tamanho BR', 'Cintura (cm)', 'Quadril (cm)', 'Comprimento (cm)'],
  rows: [
    ['34', '62–65', '88–91', '98–100'],
    ['36', '66–69', '92–95', '100–102'],
    ['38', '70–73', '96–99', '102–104'],
    ['40', '74–77', '100–103', '104–106'],
    ['42', '78–82', '104–108', '106–108'],
    ['44', '83–87', '109–113', '108–110'],
  ],
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gold/20">
            {headers.map((h) => (
              <th key={h} className="text-left text-offwhite/40 text-xs tracking-widest uppercase py-3 pr-6 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gold/10 hover:bg-offwhite/5 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`py-3 pr-6 ${j === 0 ? 'text-gold text-xs tracking-widest uppercase' : 'text-offwhite/60 text-sm'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function GuiaDeTamanhosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Ajuda</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-4">Guia de Tamanhos</h1>
      <p className="text-offwhite/40 text-sm leading-relaxed mb-12">
        Use as tabelas abaixo para encontrar seu tamanho ideal. As medidas podem variar levemente entre marcas — em caso de dúvida, prefira o tamanho maior ou consulte a marca.
      </p>

      {/* How to measure */}
      <div className="border border-gold/10 p-6 mb-12">
        <h2 className="text-offwhite text-sm font-medium tracking-wide mb-4">Como tirar suas medidas</h2>
        <ul className="space-y-3">
          {[
            { label: 'Busto', desc: 'Meça na parte mais larga do peito, passando pelas costas.' },
            { label: 'Cintura', desc: 'Meça na parte mais fina do tronco, geralmente 2–3 cm acima do umbigo.' },
            { label: 'Quadril', desc: 'Meça na parte mais larga dos quadris, mantendo a fita paralela ao chão.' },
            { label: 'Comprimento', desc: 'Do cós até o ponto desejado (joelho, tornozelo, etc.).' },
          ].map((item) => (
            <li key={item.label} className="flex gap-3 text-sm">
              <span className="text-gold/60 font-medium min-w-[80px]">{item.label}</span>
              <span className="text-offwhite/50">{item.desc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Clothing */}
      <div className="mb-12">
        <h2 className="text-gold text-xs tracking-[0.3em] uppercase mb-6 pb-3 border-b border-gold/20">
          Roupas — Tops, Vestidos e Macacões
        </h2>
        <Table {...clothingTable} />
      </div>

      {/* Pants */}
      <div className="mb-12">
        <h2 className="text-gold text-xs tracking-[0.3em] uppercase mb-6 pb-3 border-b border-gold/20">
          Calças e Shorts
        </h2>
        <Table {...pantsTable} />
      </div>

      {/* Tips */}
      <div className="border-t border-gold/10 pt-10">
        <h2 className="text-offwhite text-sm font-medium tracking-wide mb-4">Dicas de modelagem</h2>
        <ul className="space-y-3">
          {[
            'Tecidos com elastano podem ter mais flexibilidade — considere o tamanho de baixo.',
            'Peças de linho e algodão sem elastano tendem a encolher levemente na primeira lavagem.',
            'Em caso de dúvida entre dois tamanhos, escolha o maior para mais conforto.',
            'Cada marca pode ter variação de até 2 cm em suas tabelas. Consulte a descrição do produto.',
          ].map((tip, i) => (
            <li key={i} className="flex gap-3 text-offwhite/50 text-sm leading-relaxed">
              <span className="text-gold/40 mt-0.5 flex-shrink-0">—</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
