const jwt = require("jsonwebtoken")

export const SECRET1 = process.env.SECRET1
export const SECRET2 = process.env.SECRET2
export const accessTokenExpiry = 100 * 60 * 20 //20 minutes
export const refreshTokenExpiery = 100 * 60 * 60 * 24 * 1 // one day
export const accessTokenBefore = 100 * 60 * 5

60 * 10

export async function createRefreshToken(id) {
	return await jwt.sign({ id: id, expiery: Date.now() + refreshTokenExpiery }, SECRET2)
}

export async function createAccessToken(id) {
	return await jwt.sign({ id: id, expiery: Date.now() + accessTokenExpiry }, SECRET1)
}

async function isAccessTokenExpired(token, secretKey) {
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
	let Token = jwt.verify(token, SECRET2)
	return { acessToken: createAccessToken(Token.id), refreshToken: createRefreshToken(Token.id) }
}

async function isRefreshTokenExpired(token, secretKey) {
	let Token = jwt.verify(token, secretKey)
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

export async function validateReq(AcessTokenArg, RefreshTokenArg) {
	let acessToken = isAccessTokenExpired(AcessTokenArg)
	let refreshToken = isRefreshTokenExpired(RefreshTokenArg)
	if (acessToken.expired) {
		if (refreshToken.expired) {
			return new Error("Refesh Token expired login again")
		} else {
			let tokens = createAccessTokenFromRefreshToken(RefreshTokenArg)
			tokens.sendNew = true
		}
	} else {
		let refreshToken = isRefreshTokenExpired(RefreshToken)
	}
}
