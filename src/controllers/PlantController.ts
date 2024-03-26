import { Plant, Prisma } from '@prisma/client'
import { NextFunction, Request, Response, query } from 'express'
import prisma from '../db-connection/prisma'
interface FilterPlant {
  type?: string
  watering?: string
  flowers?: boolean
  careLevel?: string
  cuisine?: boolean
  poisonousToHumans?: boolean
  poisonousToPets?: boolean
}

type SortOrder = 'asc' | 'desc'
const PlantController = {
  async getFilteredPlants(
    order: SortOrder | null = null,
    page: number,
    perPage: number,
    filter: FilterPlant,
    searchParam?: string
  ) {
    const skip = (page - 1) * perPage

    type PrimaFindAllType = Prisma.Args<typeof prisma.plant, 'findMany'>
    type PrismaCountType = Prisma.Args<typeof prisma.plant, 'count'>

    const prismaWhereOptions = {
      where: {
        AND: [
          filter,
          searchParam
            ? {
                OR: [
                  {
                    commonName: {
                      contains: searchParam,
                      mode: 'insensitive',
                    },
                  },
                  {
                    scientificName: {
                      contains: searchParam,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {},
        ],
      },
      orderBy: order
        ? {
            commonName: order,
          }
        : undefined,
    }

    const plants = await prisma.plant.findMany({
      include: {
        CareGuide: true,
      },
      ...(prismaWhereOptions as PrimaFindAllType),
      skip: skip,
      take: perPage,
    })

    const count = await prisma.plant.count(
      prismaWhereOptions as PrismaCountType
    )

    return { plants, count }
  },
  async getPlants(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.session.csrf);
      const DEFAULT_PAGE = 1
      const DEFAULT_PER_PAGE = 30

      const { query, orderBy } = req.query

      const page = parseInt(req.query.page as string) || DEFAULT_PAGE
      const perPage = parseInt(req.query.pageSize as string) || DEFAULT_PER_PAGE

      const orderByValue =
        typeof orderBy === 'string' && (orderBy === 'asc' || orderBy === 'desc')
          ? orderBy
          : null

      const filterParams: FilterPlant = {
        type: req.query.type as string,
        watering: req.query.watering as string,
        flowers: req.query.flowers ? true : undefined,
        careLevel: req.query.careLevel as string,
        cuisine: req.query.cuisine ? true : undefined,
        poisonousToHumans: req.query.poisonousToHumans ? true : undefined,
        poisonousToPets: req.query.poisonousToPets ? true : undefined,
      }

      const { plants, count } = await PlantController.getFilteredPlants(
        orderByValue,
        page,
        perPage,
        filterParams,
        query as string
      )

      const totalPages = Math.ceil(count / perPage)

      // get types, watering and careLevel for generation of front-end filter list
      const types = await PlantController.getTypePlant()
      const watering = await PlantController.getWateringPlant()
      const careLevel = await PlantController.getCareLevelPlant()

      return res.status(200).json({
        plants: plants,
        currentPage: page,
        perPage,
        totalPlants: count,
        totalPages,
        types,
        watering,
        careLevel,
      })
    } catch (error) {
      next(error)
    }
  },
  async getTypePlant() {
    const types = await prisma.plant.findMany({
      select: {
        type: true,
      },
      distinct: ['type'],
    })

    const typeList = types.map((plant) => plant.type)
    return typeList
  },
  async getWateringPlant() {
    const watering = await prisma.plant.findMany({
      select: {
        watering: true,
      },
      distinct: ['watering'],
    })

    const wateringList = watering.map((plant) => plant.watering)
    return wateringList
  },
  async getCareLevelPlant() {
    const careLevel = await prisma.plant.findMany({
      select: {
        careLevel: true,
      },
      distinct: ['careLevel'],
    })

    const careLevelList = careLevel.map((plant) => plant.careLevel)
    return careLevel
  },

  async getOnePlant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const parsedId = parseInt(id)

      if (!id || !parsedId) {
        return res.status(404).json('Not found')
      }

      const plant = await prisma.plant.findFirst({
        where: {
          id: parsedId,
        },
        include: {
          CareGuide: {
            include: {
              careGuideType: true,
            },
          },
          Faq: true,
        },
      })
      return res.status(200).json(plant)
    } catch (error) {
      next(error)
    }
  },
}
export default PlantController
