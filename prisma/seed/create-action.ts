import prisma from '../../src/db-connection/prisma'

//file to create actions for testing purposes

const PLANT_ID_TO_CREATE_ACTIONS_FOR = 1934
const USER_ID_TO_CREATE_ACTIONS_FOR = 16

async function createAction() {
  const plant = await prisma.plant.findUnique({
    where: {
      id: PLANT_ID_TO_CREATE_ACTIONS_FOR,
    },
  })

  if (!plant) {
    throw new Error('Plant does not exist')
  }

  const actionType = await prisma.actionType.findUnique({
    where: {
      code: 'watering',
    },
  })

  if (!actionType) {
    throw new Error('Action type does not exist')
  }

  //get user
  const user = await prisma.user.findUnique({
    where: {
      id: USER_ID_TO_CREATE_ACTIONS_FOR,
    },
  })

  if (!user) {
    throw new Error('User does not exist')
  }

  //create user plant
  const userPlant = await prisma.userPlant.create({
    data: {
      acquisitionDate: new Date(),
      plantId: plant.id,
      userId: user.id,
      nickname: 'Camellia Jordana',
    },
  })

  //create action 35 days ago
  // await prisma.action.create({
  //   data: {
  //     date: new Date(new Date().setDate(new Date().getDate() - 35)),
  //     actionTypeId: actionType.id,
  //     userPlantId: userPlant.id,
  //     done: true,
  //     doneDate: new Date(new Date().setDate(new Date().getDate() - 34)),
  //   },
  // })

  // //create action 28 days ago
  // await prisma.action.create({
  //   data: {
  //     date: new Date(new Date().setDate(new Date().getDate() - 28)),
  //     actionTypeId: actionType.id,
  //     userPlantId: userPlant.id,
  //     done: true,
  //     doneDate: new Date(new Date().setDate(new Date().getDate() - 27)),
  //   },
  // })

  //create action 21 days ago
  await prisma.action.create({
    data: {
      date: new Date(new Date().setDate(new Date().getDate() - 21)),
      actionTypeId: actionType.id,
      userPlantId: userPlant.id,
      done: true,
      doneDate: new Date(new Date().setDate(new Date().getDate() - 22)),
    },
  })

  //create action 14 days ago
  await prisma.action.create({
    data: {
      date: new Date(new Date().setDate(new Date().getDate() - 14)),
      actionTypeId: actionType.id,
      userPlantId: userPlant.id,
      done: true,
      doneDate: new Date(new Date().setDate(new Date().getDate() - 13)),
    },
  })

  //create action 7 days ago
  await prisma.action.create({
    data: {
      date: new Date(new Date().setDate(new Date().getDate() - 7)),
      actionTypeId: actionType.id,
      userPlantId: userPlant.id,
    },
  })

  console.log('actions created successfully')
}

createAction()
