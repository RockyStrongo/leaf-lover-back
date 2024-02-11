import { Action, Plant, UserPlant } from '@prisma/client'

export type UserPlantWithDetails = UserPlant & {
  Action: Action[]
  plant: Plant
}
