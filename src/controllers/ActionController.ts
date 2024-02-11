import { Action } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import prisma from '../db-connection/prisma'
import { UserPlantWithDetails } from '../types/UserPlantWithDetails'
import { getUserIdFromAuthCookie } from '../services/getUserIdFromAuthCookie'
import dayjs from 'dayjs'

export const ActionController = {
  async markActionAsDone(req: Request, res: Response, next: NextFunction) {
    try {
      const { actionId } = req.params

      if (!actionId) {
        return res.status(400).json({ message: 'Action id is required' })
      }

      // check if action exists
      const action = await prisma.action.findUnique({
        where: {
          id: Number(actionId),
        },
        include: {
          userPlant: true,
        },
      })

      if (!action) {
        return res.status(404).json({ message: 'Action not found' })
      }

      //if action date is in future, do nothing
      const today = dayjs()
      const actionDate = dayjs(action.date)
      if (actionDate.isAfter(today)) {
        return res.status(400).json({ message: 'Action date is in future' })
      }

      // check if user plant is related to user
      const userId = getUserIdFromAuthCookie(req)
      if (!userId) {
        return res.status(404).json({ message: 'User not found' })
      }

      if (action.userPlant.userId !== userId) {
        return res.status(404).json({ message: 'User plant not found' })
      }

      //mark action as done
      const actionUpdated = await prisma.action.update({
        where: {
          id: Number(actionId),
        },
        data: {
          done: true,
          doneDate: new Date(),
        },
      })

      //get related user plant
      const userPlant = await prisma.userPlant.findUnique({
        where: {
          id: action.userPlantId,
          active: true,
        },
        include: {
          plant: true,
          Action: true,
        },
      })

      if (!userPlant) {
        return res.status(404).json('User plant not found')
      }

      // create next action if needed
      const actionToCreate =
        ActionController.calculateUserPlantActions(userPlant)

      if (actionToCreate) {
        await ActionController.createAction(
          actionToCreate.date,
          actionToCreate.userPlantId
        )
      }

      res.status(200).json({ actionUpdated, actionToCreate })
    } catch (error) {
      next(error)
    }
  },
  async createAction(date: Date, userPlantId: number) {
    try {
      // as of now, we only have watering action type
      // get watering action type
      const wateringActionType = await ActionController.getWateringActionType()

      // check if userPlantId exists
      const userPlant = await prisma.userPlant.findUnique({
        where: {
          id: userPlantId,
          active: true,
        },
      })

      if (!userPlant) {
        throw new Error('User plant does not exist')
      }

      // create action
      const action = await prisma.action.create({
        data: {
          date,
          userPlantId,
          actionTypeId: wateringActionType.id,
        },
      })

      return action
    } catch (error: unknown) {
      throw new Error(`${error}`)
    }
  },
  async getWateringActionType() {
    // as of now, we only have watering action type
    // if watering action type does not exist, create it
    // if it exists, return it
    const wateringActionType = await prisma.actionType.upsert({
      where: {
        code: 'watering',
      },
      update: {},
      create: {
        code: 'watering',
        label: 'Watering',
      },
    })

    return wateringActionType
  },
  getActionWithHighestDate(actions: Action[]) {
    // if there are no actions, return empty array
    if (actions.length === 0) {
      return null
    }

    const lastAction = actions.reduce((prev, current) => {
      return prev.date > current.date ? prev : current
    })
    return lastAction
  },

  /*
   * calculateUserPlantActions
   * this function will be called when a user plant is created and when a userplant is marked as done
   * in the future (when notification are in scope) it can be called by a cron job for notification management
   * it will calculate the next action date and return the action to be created if necessary
   */
  calculateUserPlantActions(userPlant: UserPlantWithDetails): {
    date: Date
    userPlantId: number
  } | null {
    // get plant action with highest date
    const lastAction = ActionController.getActionWithHighestDate(
      userPlant.Action
    )

    // get plant watering frequency
    // we also have watering unit, but as of now we have never seen another unit than days
    // we assume it will always be days
    const wateringFrequencyValue = userPlant.plant.wateringGeneralBenchmarkValue

    //if there is no last action, create new action with date = today + watering frequency
    if (!lastAction) {
      let nextActionDate = new Date()
      nextActionDate.setDate(nextActionDate.getDate() + wateringFrequencyValue)
      const actionToCreate = {
        date: nextActionDate,
        userPlantId: userPlant.id,
      }
      return actionToCreate
    }

    // if last action is not done, do nothing
    if (!lastAction.done) {
      return null
    }

    // if last action is done,
    // create new action at date = today + watering frequency
    const today = dayjs()
    const nextActionDateToCreate = today.add(wateringFrequencyValue, 'day')

    //if there is already an action at this date, do nothing
    const actionAlreadyExists = userPlant.Action.find((action) => {
      return dayjs(action.date).isSame(nextActionDateToCreate, 'day')
    })

    if (actionAlreadyExists) {
      return null
    }

    // else return action to create
    const actionToCreate = {
      date: nextActionDateToCreate.toDate(),
      userPlantId: userPlant.id,
    }

    return actionToCreate
  },
  async getActionsNotDone(req: Request, res: Response, next: NextFunction) {
    const userId = getUserIdFromAuthCookie(req)

    if (!userId) {
      return res.status(404).json({ message: 'User not found' })
    }

    const actions = await prisma.action.findMany({
      where: {
        userPlant: {
          userId: userId,
        },
        done: false,
      },
      include: {
        userPlant: {
          include: {
            plant: true,
          },
        },
        type: true,
      },
    })

    return res.status(200).json(actions)
  },
}
