const bcrypt = require('bcryptjs')
const { createAccessToken, createRefreshToken, addRefreshToken } = require('../../utils')
require('dotenv').config()

async function signup(_, args, ctx) {
	try {
		const { email, name, password } = args.input
		let obj = {}
		obj.email = email
		obj.name = name
		obj.password = await bcrypt.hash(password, 10)
		let data = await ctx.prisma.createUser({ ...obj })
		const accessToken = createAccessToken(data.id)
		const refreshToken = await createRefreshToken(ctx, data.id)
		addRefreshToken(ctx, refreshToken)
		return {
			accessToken,
			refreshToken,
			user: data,
		}
	} catch (err) {
		console.warn(err)
		throw new Error(err)
	}
}

async function login(_, args, ctx) {
	try {
		const { email, password } = args.input
		let data = await ctx.prisma.user({ email })
		if (!data) {
			return new Error('Looks like you are not registered please sign up')
		}
		let passwordSame = await bcrypt.compare(password, data.password)
		if (!passwordSame) {
			return new Error('Wrong Password')
		}
		const accessToken = createAccessToken(data.id)
		const refreshToken = await createRefreshToken(ctx, data.id)
		addRefreshToken(ctx, refreshToken)
		return {
			accessToken,
			refreshToken,
			user: data,
		}
	} catch (err) {
		console.warn(err)
		throw new Error(err)
	}
}

async function askForNewTokens(_, args, ctx) {
	try {
		// const { input } = args
		const { isRefreshTokenExpired, createAccessTokenFromRefreshToken } = utils
		const { refreshToken } = ctx.request.response.cookie
		let data = isRefreshTokenExpired(refreshToken)
		if (data.expired) {
			return new Error('acess Token Expired Login Again')
		} else {
			let newTokens = await createAccessTokenFromRefreshToken(ctx, refreshToken)
			return {
				accessToken: newTokens.accessToken,
				refreshToken: newTokens.refreshToken,
			}
		}
	} catch (err) {
		console.warn(err)
		throw new Error(err)
	}
}
module.exports = {
	signup,
	login,
	askForNewTokens,
}
