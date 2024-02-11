import express from 'express'
import PlantController from '../controllers/PlantController'
const router = express.Router()
import { NextFunction, Request, Response } from 'express'
import FaqController from '../controllers/FaqController'
import { AuthController } from '../controllers/AuthController'
import authMiddleware from '../middleware/authMiddleware'
import { UserController } from '../controllers/UserController';
import { ActionController } from '../controllers/ActionController'
import UserPlantController from '../controllers/UserPlantController'

const apiVersion = process.env.API_VERSION ?? 'v1'

//public routes
router.get('/', (req: Request, res: Response) => {
  return res.status(200).json(`API is running - version ${apiVersion}`)
})
router.get(`/api/${apiVersion}/plants`, PlantController.getPlants)
router.get(`/api/${apiVersion}/plants/:id`, PlantController.getOnePlant)
router.get(`/api/${apiVersion}/faqs`, FaqController.getFaqs)

router.post(
  `/api/${apiVersion}/users`,
  AuthController.validateRegister,
  AuthController.register
)
router.post(
  `/api/${apiVersion}/users/login`,
  AuthController.validateLogin,
  AuthController.login
)
router.get(
  `/api/${apiVersion}/users/verify-email/:id/:token`,
  AuthController.verifyEmail
)
router.post(`/api/${apiVersion}/users/logout`, AuthController.logout)

router.post(`/api/${apiVersion}/users/forgot-password`, AuthController.forgotPassword)
router.post(`/api/${apiVersion}/users/reset-password`, AuthController.validateResetPassword, AuthController.resetPassword)
//protected routes
router.patch(
  `/api/${apiVersion}/users`,
  authMiddleware,
  UserController.validateUpdate,
  UserController.updateUser
)
router.post(
  `/api/${apiVersion}/users/update-password`,
  authMiddleware,
  AuthController.validatePassword,
  UserController.updatePassword
)
router.post(
  `/api/${apiVersion}/users/resend-email-verification`, 
  authMiddleware, 
  AuthController.sendMailVerification
)
router.get(
  `/api/${apiVersion}/users/plants`,
  authMiddleware,
  UserPlantController.getUserPlants
)
router.get(
  `/api/${apiVersion}/users/plants/:plantId`,
  authMiddleware,
  UserPlantController.getOneUserPlant
)
router.post(
  `/api/${apiVersion}/users/plants/:plantId`,
  authMiddleware,
  UserPlantController.validateAddPlantToUser,
  UserPlantController.addPlantToUserPlants
)
router.patch(
  `/api/${apiVersion}/users/plants/:plantId`,
  authMiddleware,
  UserPlantController.validateAddPlantToUser,
  UserPlantController.updateUserPlant
)
router.delete(
  `/api/${apiVersion}/users/plants/:userPlantId`,
  authMiddleware,
  UserPlantController.removePlantFromCollection
)
router.patch(
  `/api/${apiVersion}/users/actions/:actionId/done`,
  authMiddleware,
  ActionController.markActionAsDone
)
router.get(
  `/api/${apiVersion}/users/actions`,
  authMiddleware,
  ActionController.getActionsNotDone
)

export default router
