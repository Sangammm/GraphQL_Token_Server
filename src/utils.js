const Server = require('graphql-yoga')
// console.log(Server.GraphQLServer);
const jwt = require('jsonwebtoken')
require('dotenv').config()
const SECRET1 = process.env.SECRET1
const SECRET2 = process.env.SECRET2
const accessTokenExpiry = 1000 * 60 * 60 * 1
const refreshTokenExpiery = 1000 * 60 * 60 * 24 * 1
const accessTokenBefore = 1000 * 60 * 50

async function createRefreshToken(ctx, id) {
	try {
		await ctx.prisma.updateManyTokens({ data: { deleted: true }, where: { userId: id, deleted: false } })
		let Obj = await ctx.prisma.createToken({ userId: id })
		return jwt.sign({ id: Obj.id, expiery: Date.now() + refreshTokenExpiery }, SECRET2)
	} catch (err) {
		throw new Error(err)
	}
}

async function validateReqMiddleware(resolve, root, args, context, info) {
	console.count(11)
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
				accessToken: newTokens.accessToken,
			}
		}
	}
	let result = await resolve(root, args, context, info)
	console.log('result: ', result)
	return { ...result, TokenInfo }
}

function createAccessToken(id) {
	try {
		return jwt.sign({ id, expiery: Date.now() + accessTokenExpiry }, SECRET1)
	} catch (err) {
		console.warn(err)
		throw new Error(err)
	}
}

function isAccessTokenExpired(token, secretKey = SECRET1) {
	try {
		let Token = jwt.verify(token, secretKey)
		console.log(new Date(Token.expiery).toLocaleString())
		if (Token.expiery < Date.now()) {
			return {
				id: Token.id,
				expired: true,
				sendNew: true,
			}
		} else {
			if (Token.expiery - Date.now() < accessTokenBefore) {
				return {
					id: Token.id,
					expired: false,
					sendNew: true,
				}
			} else {
				return {
					id: Token.id,
					expired: false,
					sendNew: false,
				}
			}
		}
	} catch (err) {
		console.warn(err)
		throw new AuthenticationError('Invalid Token');
	}
}

async function createAccessTokenFromRefreshToken(ctx, token) {
	try {
		let Token = jwt.verify(token, SECRET2)
		return { accessToken: createAccessToken(Token.id), refreshToken: await createRefreshToken(ctx, Token.id) }
	} catch (err) {
		console.warn(err)
		throw new AuthenticationError(err)
	}
}

function isRefreshTokenExpired(token) {
	try {
		let Token = jwt.verify(token, SECRET2)
		if (Token.expiery < Date.now()) {
			return {
				id: Token.id,
				expired: true,
			}
		} else {
			return {
				id: Token.id,
				expired: false,
			}
		}
	} catch (err) {
		console.warn(err)
		throw new AuthenticationError('Invalid Token');
	}
}

async function validateReq(context) {
	try {
		let accessTokenArg = context.request.get('accessToken')
		let accessToken = isAccessTokenExpired(accessTokenArg)
		let cookies = context.request.cookies
		if (accessToken.expired || accessToken.sendNew) {
			let refreshToken = isRefreshTokenExpired(cookies.refreshToken)
			// console.log('refreshToken: ', refreshToken)
			if (refreshToken.expired) {
				throw new AuthenticationError('Token Expired')
			} else {
				let newTokens = await createAccessTokenFromRefreshToken(context, cookies.refreshToken)
				console.log(newTokens)
				addRefreshToken(context, newTokens.refreshToken)
				return {
					sendNew: accessToken.sendNew,
					expired: accessToken.expired,
					accessToken: newTokens.accessToken,
				}
			}
		} else {
			return accessToken
		}
	} catch (err) {
		console.warn(err)
		throw new AuthenticationError()
	}
}

function addRefreshToken(ctx, refreshToken) {
	ctx.response.cookie('refreshToken', refreshToken, {
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
		httpOnly: true,
	})
}

module.exports = {
	createRefreshToken,
	createAccessToken,
	isAccessTokenExpired,
	createAccessTokenFromRefreshToken,
	isRefreshTokenExpired,
	validateReq,
	addRefreshToken,
}
