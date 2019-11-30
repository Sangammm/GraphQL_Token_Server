const { GraphQLServer } = require('graphql-yoga')
const cookieParser = require('cookie-parser')
// const cors = require('CORS')
const { prisma } = require('../generated/prisma-client')
const fs = require('fs')
require('dotenv').config()
const resolvers = require('./resolvers')

const server = new GraphQLServer({
	typeDefs: './src/schema.graphql',
	resolvers,
	context: request => {
		return {
			...request,
			prisma
		}
	}
})

server.express.use(cookieParser())
// server.express.use(cors())

// const httpsOptions = {
// 	key: fs.readFileSync('./server.key'),
// 	cert: fs.readFileSync('./server.cert')
// }

// server.express.use(server.options.endpoint, (req, res, done) => {
// 	res.cookie('refreshToken', 'faleToken', { maxAge: 10 * 3600 })
// 	done()
// })

server.start(
	{
		// https: httpsOptions,
		port: process.env.PORT
	},
	() => console.log('server started on port http://localhost:4001')
)
