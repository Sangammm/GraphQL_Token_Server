const { GraphQLServer } = require('graphql-yoga')
const cookieParser = require('cookie-parser')
const cors = require('CORS')
const { prisma } = require('../generated/prisma-client')
const fs = require('fs')
require('dotenv').config()
const resolvers = require('./resolvers')

async function validateReqMiddleware(resolve, root, args, context, info) {
	console.count(11)
	try {
		const accessTokenArg = context.request.get('accessToken')
		const accessToken = isAccessTokenExpired(accessTokenArg)
		const cookies = context.request.cookies
		let TokenInfo = accessToken
		// console.log('cookies: ', cookies)
		if (accessToken.expired || accessToken.sendNew) {
			let refreshToken = isRefreshTokenExpired(cookies.refreshToken)
			console.log('refreshToken: ', refreshToken)
			if (refreshToken.expired) {
				throw new Error('Token Expired')
			} else {
				const newTokens = await createAccessTokenFromRefreshToken(context, cookies.refreshToken)
				console.log(newTokens)
				addRefreshToken(context, newTokens.refreshToken)
				TokenInfo = {
					sendNew: accessToken.sendNew,
					expired: accessToken.expired,
					accessToken: newTokens.accessToken
				}
			}
		}
		let result = await resolve(root, args, context, info)
		console.log('result: ', result)
		return { ...result, TokenInfo }
	} catch (err) {
		console.warn(err)
		throw new Error(err)
	}
}

const server = new GraphQLServer({
	typeDefs: './src/schema.graphql',
	resolvers,
	context: request => {
		return {
			...request,
			prisma
		}
	},
	middlewares: [validateReqMiddleware]
})

server.express.use(cookieParser())

const httpsOptions = {
	key: fs.readFileSync('./server.key'),
	cert: fs.readFileSync('./server.cert')
}

// server.express.use(server.options.endpoint, (req, res, done) => {
// 	res.cookie('refreshToken', 'faleToken', { maxAge: 10 * 3600 })
// 	done()
// })

server.start(
	{
		// https: httpsOptions,
		port: process.env.PORT,
		cors: {
			credentials: true,
			origin: '*'
		}
	},
	() => console.log('goto http://localhost:4001')
)
