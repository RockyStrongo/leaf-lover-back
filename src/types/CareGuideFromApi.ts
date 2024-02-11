export interface CareGuideListFromApi {
    data: SpeciesInfo[]
    to: number
    per_page: number
    current_page: number
    from: number
    last_page: number
    total: number
  }
  
  export interface SpeciesInfo {
    id: number
    species_id: number
    common_name: string
    scientific_name: string[]
    section: CareGuideFromAPI[]
  }
  
  export interface CareGuideFromAPI {
    id: number
    type: string
    description: string
  }
  