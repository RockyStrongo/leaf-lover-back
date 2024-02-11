import { NextFunction, Request, Response } from 'express'
import { Result, body, validationResult } from 'express-validator'
import prisma from '../db-connection/prisma'
import { getUserIdFromAuthCookie } from '../services/getUserIdFromAuthCookie'
import { ActionController } from './ActionController'

const UserPlantController = {
  validateAddPlantToUser: [
    body('acquisitionDate').notEmpty(),
    body('nickname').isString().optional({ nullable: true }),
    body('notes').isString().optional({ nullable: true }),
    body('giftedBy').isString().optional({ nullable: true }),
    (req: Request, res: Response, next: NextFunction) => {
      const result: Result = validationResult(req)
      const errors = result.array()
      if (errors[0] && errors[0].path) {
        return res.status(422).json(`Invalid ${errors[0].path}.`)
      }
      next()
    },
  ],
  async addPlantToUserPlants(req: Request, res: Response, next: NextFunction) {
    try {
      const { plantId } = req.params
      const { acquisitionDate, nickname, notes, giftedBy } = req.body

      const parsedPlantId = parseInt(plantId)

      //get userId from cookie
      const userId = getUserIdFromAuthCookie(req)

      //if data is missing, return 404
      if (!plantId || !parsedPlantId || !userId) {
        return res.status(404).json('Not found')
      }

      //check if plant exists
      const plant = await prisma.plant.findFirst({
        where: {
          id: parsedPlantId,
        },
      })

      if (!plant) {
        console.log('missing data')
        return res.status(404).json('Plant not found')
      }

      //check if user exists
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      })

      if (!user) {
        return res.status(404).json('Not found')
      }

      //check if user already has this plant
      const userPlantExists = await prisma.userPlant.findFirst({
        where: {
          userId: userId,
          plantId: parsedPlantId,
          active: true,
        },
      })

      if (userPlantExists) {
        return res.status(409).json('Plant already exists')
      }

      //add plant to user's plants
      const userPlant = await prisma.userPlant.create({
        data: {
          userId: userId,
          plantId: parsedPlantId,
          acquisitionDate: acquisitionDate,
          nickname: nickname,
          notes: notes,
          giftedBy: giftedBy,
        },
        include: {
          plant: true,
          Action: true,
        },
      })

      // create next action
      const actionToCreate =
        ActionController.calculateUserPlantActions(userPlant)

      if (actionToCreate) {
        await ActionController.createAction(
          actionToCreate.date,
          actionToCreate.userPlantId
        )
      }

      return res.status(200).json(userPlant)
    } catch (error) {
      next(error)
    }
  },
  updateUserPlant: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { plantId } = req.params
      const { acquisitionDate, nickname, notes, giftedBy } = req.body

      const parsedPlantId = parseInt(plantId)

      //get userId from cookie
      const userId = getUserIdFromAuthCookie(req)

      //if data is missing, return 404
      if (!plantId || !parsedPlantId || !userId) {
        return res.status(404).json('Not found')
      }

      //check if plant exists
      const plant = await prisma.plant.findFirst({
        where: {
          id: parsedPlantId,
        },
      })

      if (!plant) {
        console.log('missing data')
        return res.status(404).json('Plant not found')
      }

      //check if user exists
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      })

      if (!user) {
        return res.status(404).json('Not found')
      }

      //check if user already has this plant
      const userPlantExists = await prisma.userPlant.findFirst({
        where: {
          userId: userId,
          plantId: parsedPlantId,
          active: true,
        },
      })

      if (!userPlantExists) {
        return res.status(404).json('Plant not found')
      }

      //update user's plant
      const userPlant = await prisma.userPlant.update({
        where: {
          id: userPlantExists.id,
          userId: userId,
          plantId: parsedPlantId,
        },
        data: {
          acquisitionDate: acquisitionDate,
          nickname: nickname,
          notes: notes,
          giftedBy: giftedBy,
        },
      })

      return res.status(200).json(userPlant)
    } catch (error) {
      next(error)
    }
  },
  getUserPlants: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserIdFromAuthCookie(req)

      if (!userId) {
        return res.status(404).json('Not found')
      }

      const userPlants = await prisma.userPlant.findMany({
        where: {
          userId: userId,
          active: true,
        },
        include: {
          plant: true,
        },
      })

      return res.status(200).json(userPlants)
    } catch (error) {
      next(error)
    }
  },
  getOneUserPlant: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { plantId } = req.params

      const parsedPlantId = parseInt(plantId)

      if (!plantId || !parsedPlantId) {
        return res.status(404).json('Not found')
      }

      const userId = getUserIdFromAuthCookie(req)

      if (!userId) {
        return res.status(404).json('Not found')
      }

      const NUMBER_OF_ACTIONS = 5

      const userPlant = await prisma.userPlant.findFirst({
        where: {
          userId: userId,
          plantId: parsedPlantId,
          active: true,
        },
        include: {
          plant: true,
          Action: {
            include: {
              type: true,
            },
            orderBy: {
              date: 'desc',
            },
            skip: 0,
            take: NUMBER_OF_ACTIONS, // limit number of actions
          },
        },
      })

      return res.status(200).json(userPlant)
    } catch (error) {
      next(error)
    }
  },
  async removePlantFromCollection(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userPlantId } = req.params

      if (!userPlantId) {
        return res.status(400).json({ message: 'Missing userPlantId' })
      }

      const userId = getUserIdFromAuthCookie(req)

      const userPlant = await prisma.userPlant.findUnique({
        where: {
          id: Number(userPlantId),
        },
      })
      if (!userPlant) {
        return res.status(404).json({ message: 'Plant not found' })
      }
      if (userPlant.userId !== userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      //update user plant to active = false
      const deletedPlant = await prisma.userPlant.update({
        where: {
          id: Number(userPlantId),
        },
        data: {
          active: false,
        },
      })
      return res.status(200).json(deletedPlant)
    } catch (error) {
      next(error)
    }
  },
}

export default UserPlantController
