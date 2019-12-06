const { GraphQLServer } = require('graphql-yoga')
const cookieParser = require('cookie-parser')
const { prisma } = require('../generated/prisma-client')
require('dotenv').config()
const resolvers = require('./resolvers')

async function demoMiddleware(resolve, root, args, context, info) {
	console.count('Abee Saaaleee')
	let data = resolve(root, args, context, info)
	return data
}
// const httpsOptions = {
// 	key: fs.readFileSync('./server.key'),
// 	cert: fs.readFileSync('./server.cert')
// }

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
// middlewares: [demoMiddleware]

server.express.use(cookieParser())

server.start(
	{
		// https: httpsOptions,
		port: process.env.PORT,
		cors: {
			credentials: true,
			origin: 'http://localhost:3000'
		}
	},
	() => console.log('goto http://localhost:4001')
)
