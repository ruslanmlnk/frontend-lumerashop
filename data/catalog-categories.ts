export type CatalogCategoryPreset = {
  name: string
  slug: string
  showInMenu?: boolean
  subcategories?: Array<{
    name: string
    slug: string
    showInMenu?: boolean
  }>
}

export const CATALOG_CATEGORY_PRESETS: CatalogCategoryPreset[] = [
  {
    name: 'Dámské kabelky',
    slug: 'kabelky',
    showInMenu: true,
  },
  {
    name: 'Pánské tašky',
    slug: 'panske-tasky',
    showInMenu: true,
  },
  {
    name: 'Batohy',
    slug: 'batohy',
    showInMenu: true,
    subcategories: [
      {
        name: 'Pánské Batohy',
        slug: 'panske-batohy',
        showInMenu: true,
      },
      {
        name: 'Ženské batohy',
        slug: 'zenske-batohy',
        showInMenu: true,
      },
    ],
  },
  {
    name: 'Doplňky',
    slug: 'doplnky',
    showInMenu: true,
    subcategories: [
      {
        name: 'Opasky',
        slug: 'opasky',
        showInMenu: true,
      },
      {
        name: 'Peněženky',
        slug: 'penezenky',
        showInMenu: true,
      },
    ],
  },
  {
    name: 'Dárkové poukazy',
    slug: 'darkove-poukazy',
    subcategories: [
      {
        name: 'Dárkový poukaz elektronický',
        slug: 'darkovy-poukaz-elektronicky',
      },
      {
        name: 'Dárkový poukaz tištěný',
        slug: 'darkovy-poukaz-tisteny',
      },
    ],
  },
  {
    name: 'DAVID JONES',
    slug: 'david-jones',
  },
  {
    name: 'ENRICO COVERI',
    slug: 'enrico-coveri',
  },
  {
    name: 'Akce',
    slug: 'akce',
  },
]
