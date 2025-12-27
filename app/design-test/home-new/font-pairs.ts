export const fontPairs = [
  {
    id: 'oswald-montserrat-roboto',
    name: 'Oswald + Montserrat + Roboto',
    description: 'Спортивный профессионал',
    mainHeadingClass: 'font-oswald',
    subHeadingClass: 'font-montserrat font-semibold',
    bodyClass: 'font-roboto',
    accentClass: 'font-montserrat font-medium',
  }
]

export type FontPairId = typeof fontPairs[number]['id']
