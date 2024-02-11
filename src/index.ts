import express from 'express'
import router from './router'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import errorHandler from './middleware/errorHandler'
import notFound from './middleware/notFound'
import bodyParser from 'body-parser'

dotenv.config()

const app = express()

// Helmet middleware before other middleware and routes to set secured HTTP headers
app.use(helmet())

const oneMinute = 1 * 60 * 1000
const maxRequests = process.env.RATE_LIMITING_REQUESTS ?? '100'

// Apply rate limiter to all requests
const limiter = rateLimit({
  windowMs: oneMinute, // 1 minute
  max: parseInt(maxRequests), // number of requests per windowMs
})
app.use(limiter)
app.use(express.urlencoded({ extended: true }))

app.use(express.json())

const cookieParser = require('cookie-parser')

const COOKIE_SECRET = process.env.COOKIE_SECRET

const frontDomain = process.env.FRONT_DOMAIN_URL
if (!frontDomain) {
  throw new Error('FRONT_DOMAIN_URL environment variable missing')
}
const corsOptions = {
  credentials: true,
  origin: [frontDomain, 'http://localhost:3000'],
}

app.use(cookieParser(COOKIE_SECRET))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors(corsOptions))

app.use(router)
app.use(errorHandler)
app.use(notFound)

const port = process.env.PORT
const server = app.listen(port, () =>
  console.log(`🚀 Server ready at: http://localhost:${port}`)
)
