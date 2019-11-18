const jwt = require("jsonwebtoken")
require("dotenv").config()
const SECRET1 = process.env.SECRET1
const SECRET2 = process.env.SECRET2
const accessTokenExpiry = 100 * 60 * 20 //20 minutes
const refreshTokenExpiery = 100 * 60 * 60 * 24 * 1 // one day
const accessTokenBefore = 100 * 60 * 5

function createRefreshToken(id) {
	return jwt.sign({ id: id, expiery: Date.now() + refreshTokenExpiery }, SECRET2)
}

function createAccessToken(id) {
	return jwt.sign({ id, expiery: Date.now() + accessTokenExpiry }, SECRET1)
}

function isAccessTokenExpired(token, secretKey = SECRET1) {
	let Token = jwt.verify(token, secretKey)
	if (Token.expiery > Date.now()) {
		return {
			id: Token.id,
			expired: true,
			sendNew: false
		}
	} else {
		if (Token.expiery + accessTokenBefore > Date.now()) {
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
}

async function createAccessTokenFromRefreshToken(token) {
	let Token = await jwt.verify(token, SECRET2)
	return { accessToken: await createAccessToken(Token.id), refreshToken: await createRefreshToken(Token.id) }
}

async function isRefreshTokenExpired(token) {
	let Token = jwt.verify(token, SECRET2)
	if (Token.expiery > Date.now()) {
		return {
			id: Token.id,
			expired: true
		}
	} else {
		return {
			id: Token.id,
			expired: fasle
		}
	}
}

async function validateReq(context) {
	let accessTokenArg = context.request.get("Authorization")
	let accessToken = isAccessTokenExpired(accessTokenArg)
	if (accessToken.expired) {
		return new Error("Token expired")
	} else {
		return accessToken.id
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
