const jwt = require("jsonwebtoken")
require("dotenv").config()
const SECRET1 = process.env.SECRET1
const SECRET2 = process.env.SECRET2
const accessTokenExpiry = 1000 * 60 * 10 //20 minutes
const refreshTokenExpiery = 1000 * 60 * 60 * 24 * 1 // one day
const accessTokenBefore = 1000 * 60 * 5

async function createRefreshToken(ctx, id) {
	try {
		await ctx.prisma.updateManyTokens({ data: { deleted: true }, where: { userId: id, deleted: false } })
		let Obj = await ctx.prisma.createToken({ userId: id })
		console.log("OBJ", Obj)
		return jwt.sign({ id: Obj.id, expiery: Date.now() + refreshTokenExpiery }, SECRET2)
	} catch (err) {
		console.warn(err)
	}
}

function createAccessToken(id) {
	try {
		return jwt.sign({ id, expiery: Date.now() + accessTokenExpiry }, SECRET1)
	} catch (err) {
		console.warn(err)
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
				sendNew: true
			}
		} else {
			if (Token.expiery < Date.now() + accessTokenBefore) {
				return {
					id: Token.id,
					expired: false,
					sendNew: true
				}
			} else {
				return {
					id: Token.id,
					expired: false,
					sendNew: false
				}
			}
		}
	} catch (err) {
		console.warn(err)
	}
}

async function createAccessTokenFromRefreshToken(ctx, token) {
	try {
		let Token = jwt.verify(token, SECRET2)
		return { accessToken: createAccessToken(Token.id), refreshToken: await createRefreshToken(ctx, Token.id) }
	} catch (err) {
		console.warn(err)
	}
}

function isRefreshTokenExpired(token) {
	try {
		let Token = jwt.verify(token, SECRET2)
		if (Token.expiery < Date.now()) {
			return {
				id: Token.id,
				expired: true
			}
		} else {
			return {
				id: Token.id,
				expired: false
			}
		}
	} catch (err) {
		console.warn(err)
	}
}

function validateReq(context) {
	try {
		let accessTokenArg = context.request.get("accessToken")
		let accessToken = isAccessTokenExpired(accessTokenArg)
		console.log(11, accessToken)
		if (accessToken.expired) {
			// return accessToken
			throw new Error("Token expired")
		} else {
			return accessToken
		}
	} catch (err) {
		console.warn(err)
	}
}
module.exports = {
	createRefreshToken,
	createAccessToken,
	isAccessTokenExpired,
	createAccessTokenFromRefreshToken,
	isRefreshTokenExpired,
	validateReq
}
