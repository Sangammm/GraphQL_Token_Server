const bcrypt = require("bcryptjs")
const {
	isRefreshTokenExpired,
	createAccessTokenFromRefreshToken,
	createAccessToken,
	createRefreshToken
} = require("../../utils")
require("dotenv").config()

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
		return {
			accessToken,
			refreshToken,
			user: data
		}
	} catch (err) {
		console.warn(err)
	}
}

async function login(_, args, ctx) {
	try {
		const { email, password } = args.input
		let data = await ctx.prisma.user({ email })
		if (!data) {
			return new Error("Looks like you are not registered please sign up")
		}
		let passwordSame = await bcrypt.compare(password, data.password)
		if (!passwordSame) {
			return new Error("Wrong Password")
		}
		console.log(data.id)
		const accessToken = createAccessToken(data.id)
		const refreshToken = createRefreshToken(ctx, data.id)
		return {
			accessToken,
			refreshToken,
			user: data
		}
	} catch (err) {
		console.warn(err)
	}
}

async function askForNewTokens(_, args, ctx) {
	try {
		const { input } = args
		// const { isRefreshTokenExpired, createAccessTokenFromRefreshToken } = utils
		let data = isRefreshTokenExpired(input)
		if (data.expired) {
			return new Error("acess Token Expired Login Again")
		} else {
			let newTokens = await createAccessTokenFromRefreshToken(ctx, input)
			// console.log(4, newTokens)
			return {
				accessToken: newTokens.accessToken,
				refreshToken: newTokens.refreshToken
			}
		}
	} catch (err) {
		console.warn(err)
	}
}
module.exports = {
	signup,
	login,
	askForNewTokens
}
