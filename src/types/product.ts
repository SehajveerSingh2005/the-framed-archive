export type Size = 'small' | 'medium' | 'large'

export type PrintOption = 'poster' | 'posterwf' | 'canvas'

export const sizeDetails = {
  small: {
    width: 30,
    height: 40
  },
  medium: {
    width: 45,
    height: 60
  },
  large: {
    width: 60,
    height: 80
  }
}

export const printOptionDetails = {
  poster: {
    name: 'Premium Poster (Without Frame)',
    priceMultiplier: 1
  },
  posterwf: {
    name: 'Premium Poster (With Frame)',
    priceMultiplier: 1.5
  },
  canvas: {
    name: 'Stretched Canvas',
    priceMultiplier: 2
  }
}