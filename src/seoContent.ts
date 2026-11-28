// Fonte única do conteúdo de SEO/GEO.
// É usado em três lugares, sempre sincronizados:
//  1. Seção "Perguntas Frequentes" visível no site (App.tsx)
//  2. Schema FAQPage (JSON-LD) injetado no index.html no build (vite.config.ts)
//  3. HTML estático lido por robôs que não executam JavaScript (IAs)

export const BUSINESS = {
  name: "Eucalyptus Tratados",
  url: "https://eucalyptustratados.com.br/",
  phone: "+551532831253",
  phoneDisplay: "(15) 3283-1253",
  whatsapp: "5515996854945",
  whatsappDisplay: "(15) 99685-4945",
  email: "vendas@eucalyptustratados.com.br",
  street: "Estrada do Moinho Km 2.1",
  city: "Laranjal Paulista",
  region: "SP",
  foundingYear: "1992",
  mapsUrl: "https://maps.app.goo.gl/6pimRc4R7dyMVghZ7",
  // Perfil no Google (avaliações). Link curto de compartilhamento enviado pelo dono.
  reviewsUrl: "https://share.google/hQkp3RdFSdnMS4v39",
};

export const PRODUCTS: { name: string; description: string }[] = [
  {
    name: "Mourões de eucalipto tratado (2,20m)",
    description:
      "Mourões de 2,20m para cercas rurais e divisas, do refugo (4 a 6 cm) ao super grosso (12 a 14 cm), além de lasca.",
  },
  {
    name: "Esticadores de eucalipto tratado (2,50m)",
    description:
      "Esticadores de 2,50m para cantos e tensionamento de cercas, de 10 a 32 cm de diâmetro no topo.",
  },
  {
    name: "Palanques de eucalipto tratado (3,20m a 7m)",
    description:
      "Palanques de 3,20m, 4m, 5m, 6m e 7m para currais, porteiras, galpões e estruturas rurais, de 10 a 32 cm de diâmetro.",
  },
  {
    name: "Postes de eucalipto tratado (8m a 12m)",
    description:
      "Postes de 8 a 12m para construção civil, galpões, coberturas, pergolados e estruturas de grande carga.",
  },
  {
    name: "Madeira serrada de eucalipto tratado",
    description:
      "Caibro 5x5, caibrão 5x7, terça 5x11, viga 5x15, pranchas 5x20, 5x25 e 5x30 e ripa 2,5x5.",
  },
  {
    name: "Ripão, balancim e esteira de bambu tratado",
    description:
      "Balancim de 1,20m, ripão e esteira de bambu tratado para acabamento, sombreamento e paisagismo.",
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Por que o eucalipto citriodora é a melhor espécie para madeira tratada?",
    a: "O Eucalyptus citriodora tem fibras retorcidas e densidade alta, o que dá mais resistência mecânica e faz com que ele praticamente não rache, ao contrário de outras espécies de eucalipto, e nem precise de chapas metálicas anti-rachadura. Ele também absorve bem o preservativo CCA no tratamento em autoclave, o que o torna ideal para postes, mourões e estruturas expostas ao tempo e a cargas altas.",
  },
  {
    q: "Quanto tempo dura o eucalipto tratado da Eucalyptus Tratados?",
    a: "Em contato com o solo, o eucalipto citriodora tratado em autoclave tem durabilidade superior a 20 a 30 anos, e oferecemos 10 anos de garantia. A durabilidade vem da combinação da espécie citriodora, da secagem controlada e da impregnação do preservativo CCA sob alta pressão, que protege a madeira contra cupins, fungos e apodrecimento. Temos laudo de retenção de CCA emitido pelo IPT (Instituto de Pesquisas Tecnológicas), com retenção de 6,8 a 10,4 kg/m³ nas amostras ensaiadas.",
  },
  {
    q: "Como é feito o tratamento do eucalipto em autoclave?",
    a: "São quatro etapas: (1) seleção e preparo, com corte sob medida e descasque; (2) secagem ao ar livre por 30 a 60 dias até a umidade ideal; (3) autoclave pelo processo de célula cheia, com vácuo para retirar ar e umidade e pressão de até 18 kg/cm² para injetar o preservativo CCA; (4) repouso de 20 dias para fixação completa do produto antes da entrega.",
  },
  {
    q: "Qual norma técnica o eucalipto tratado segue?",
    a: "Seguimos a norma ABNT NBR 9480, que trata das peças roliças de eucalipto preservado. Pela norma, a medida de venda de postes e mourões é o diâmetro do topo (ponta mais fina). A base é naturalmente mais grossa e varia conforme o crescimento da árvore, por isso não é usada como medida padrão.",
  },
  {
    q: "Qual a diferença entre mourão, esticador, palanque e poste?",
    a: "A diferença principal é o comprimento e a aplicação. Mourões têm 2,20m e formam a linha da cerca. Esticadores têm 2,50m e ficam nos cantos e pontos de tensão. Palanques vão de 3,20m a 7m e são usados em currais, porteiras e estruturas rurais. Postes vão de 8m a 12m e são usados em galpões, coberturas e construção civil.",
  },
  {
    q: "Quais produtos de eucalipto tratado vocês vendem?",
    a: "Mourões de 2,20m, esticadores de 2,50m, palanques de 3,20m a 7m, postes de 8m a 12m, madeira serrada (caibro, caibrão, terça, viga, pranchas e ripa), ripão, balancim e esteira de bambu tratado. Todos em eucalipto citriodora tratado em autoclave.",
  },
  {
    q: "A madeira é de reflorestamento?",
    a: "Sim. 100% da nossa madeira vem de áreas de reflorestamento, um recurso renovável que retira carbono da atmosfera e diminui a pressão sobre as matas nativas brasileiras.",
  },
  {
    q: "Onde fica a Eucalyptus Tratados e como pedir um orçamento?",
    a: "Estamos na Estrada do Moinho Km 2.1, em Laranjal Paulista (SP), no mercado desde 1992. O orçamento é feito pelo WhatsApp (15) 99685-4945, pelo telefone (15) 3283-1253 ou pelo e-mail vendas@eucalyptustratados.com.br. Informe as medidas, a quantidade, a aplicação e a cidade de entrega.",
  },
  // Pergunta aguardando resposta: aparece no site, mas fica fora do schema até ser respondida.
  { q: "Quais as diferenças entre espécies de eucalipto?", a: "" },
];
