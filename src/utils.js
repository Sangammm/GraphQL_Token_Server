const jwt = require("jsonwebtoken")
require("dotenv").config()
const SECRET1 = process.env.SECRET1
const SECRET2 = process.env.SECRET2
const accessTokenExpiry = 1000 * 60 * 10 //20 minutes
const refreshTokenExpiery = 1000 * 60 * 60 * 24 * 1 // one day
const accessTokenBefore = 1000 * 60 * 5

function createRefreshToken(id) {
	return jwt.sign({ id: id, expiery: Date.now() + refreshTokenExpiery }, SECRET2)
}

function createAccessToken(id) {
	return jwt.sign({ id, expiery: Date.now() + accessTokenExpiry }, SECRET1)
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
		console.log(err)
	}
}

function createAccessTokenFromRefreshToken(token) {
	let Token = jwt.verify(token, SECRET2)
	return { accessToken: createAccessToken(Token.id), refreshToken: createRefreshToken(Token.id) }
}

function isRefreshTokenExpired(token) {
	let Token = jwt.verify(token, SECRET2)
	if (Token.expiery < Date.now()) {
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

function validateReq(context) {
	let accessTokenArg = context.request.get("accessToken")
	let accessToken = isAccessTokenExpired(accessTokenArg)
	console.log(11, accessToken)
	if (accessToken.expired) {
		// return accessToken
		throw new Error("Token expired")
	} else {
		return accessToken
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
