export interface FAQListFromAPI {
    data: FAQFromAPI[]
    to: number
    per_page: number
    current_page: number
    from: number
    last_page: number
    total: number
  }
  
  export interface FAQFromAPI {
    id: number
    question: string
    answer: string
    tags: string[]
    default_image?: DefaultImage
  }
  
  export interface DefaultImage {
    license: number
    license_name: string
    license_url: string
    original_url: string
    regular_url: string
    medium_url: string
  }
  