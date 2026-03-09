export type CatalogFilterPreset = {
  name: string
  slug: string
  sortOrder: number
  options: Array<{
    name: string
    sortOrder: number
  }>
}

export const CATALOG_FILTER_PRESETS: CatalogFilterPreset[] = [
  {
    name: 'Material',
    slug: 'material',
    sortOrder: 10,
    options: [
      { name: 'kůže', sortOrder: 10 },
      { name: 'semišová kůže', sortOrder: 20 },
    ],
  },
  {
    name: 'Barva',
    slug: 'barva',
    sortOrder: 20,
    options: [
      { name: 'tmavě hnědá', sortOrder: 10 },
      { name: 'černá', sortOrder: 20 },
      { name: 'taupe', sortOrder: 30 },
      { name: 'hnědá', sortOrder: 40 },
      { name: 'koňak', sortOrder: 50 },
      { name: 'vínová', sortOrder: 60 },
      { name: 'béžová', sortOrder: 70 },
      { name: 'šedá', sortOrder: 80 },
      { name: 'červená', sortOrder: 90 },
      { name: 'zelená', sortOrder: 100 },
      { name: 'modrá', sortOrder: 110 },
    ],
  },
  {
    name: 'Kování',
    slug: 'kovani',
    sortOrder: 30,
    options: [
      { name: 'zlatá barva', sortOrder: 10 },
      { name: 'stříbrná barva', sortOrder: 20 },
      { name: 'zlatá kartáčová barva', sortOrder: 30 },
      { name: 'bez kovu', sortOrder: 40 },
    ],
  },
  {
    name: 'Podšívka',
    slug: 'podsivka',
    sortOrder: 40,
    options: [
      { name: 'ano', sortOrder: 10 },
      { name: 'ne', sortOrder: 20 },
    ],
  },
  {
    name: 'Druhy dámských kabelek',
    slug: 'druhy-damskych-kabelek',
    sortOrder: 50,
    options: [
      { name: 'Kabelky do ruky', sortOrder: 10 },
      { name: 'Trendové kabelky', sortOrder: 20 },
      { name: 'Luxusní kabelky', sortOrder: 30 },
      { name: 'Kabelky přes rameno', sortOrder: 40 },
      { name: 'Velké kabelky', sortOrder: 50 },
      { name: 'Střední kabelky', sortOrder: 60 },
      { name: 'Malé kabelky', sortOrder: 70 },
      { name: 'Shopper kabelky', sortOrder: 80 },
      { name: 'Batužky', sortOrder: 90 },
      { name: 'Crossbody kabelky', sortOrder: 100 },
      { name: 'Cestovní tašky', sortOrder: 110 },
      { name: 'S řetízkovým popruhem', sortOrder: 120 },
      { name: 'Kabelky s třásněmi', sortOrder: 130 },
      { name: 'Kabelky s kožešinou', sortOrder: 140 },
    ],
  },
  {
    name: 'Druhy pánských tašek',
    slug: 'druhy-panskych-tasek',
    sortOrder: 60,
    options: [
      { name: 'Cestovní tašky', sortOrder: 10 },
      { name: 'Batohy', sortOrder: 20 },
      { name: 'Crossbody tašky', sortOrder: 30 },
      { name: 'Pracovní tašky', sortOrder: 40 },
      { name: 'Tašky na notebook', sortOrder: 50 },
    ],
  },
  {
    name: 'Stav',
    slug: 'stav',
    sortOrder: 70,
    options: [
      { name: 'Skladem', sortOrder: 10 },
      { name: 'Není skladem', sortOrder: 20 },
      { name: 'Na objednávku', sortOrder: 30 },
    ],
  },
  {
    name: 'Určení',
    slug: 'urceni',
    sortOrder: 80,
    options: [
      { name: 'Dámské', sortOrder: 10 },
      { name: 'Pánské', sortOrder: 20 },
      { name: 'Unisex', sortOrder: 30 },
    ],
  },
]
