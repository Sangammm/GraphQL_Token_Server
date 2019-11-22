const bcrypt = require("bcryptjs")
const {
	isRefreshTokenExpired,
	createAccessTokenFromRefreshToken,
	createAccessToken,
	createRefreshToken
} = require("../../utils")
require("dotenv").config()

async function signup(_, args, ctx) {
	// console.log(args.input.email);
	const { email, name, password } = args.input
	let obj = {}
	obj.email = email
	obj.name = name
	obj.password = await bcrypt.hash(password, 10)
	let data = await ctx.prisma.createUser({ ...obj })
	const accessToken = createAccessToken(data.id)
	const refreshToken = createRefreshToken(data.id)

	return {
		accessToken,
		refreshToken,
		user: data
	}
}

async function login(_, args, ctx) {
	console.log(args.input)
	const { email, password } = args.input
	let data = await ctx.prisma.user({ email })
	if (!data) {
		return new Error("Looks like you are not registered please sign up")
	}
	let passwordSame = await bcrypt.compare(password, data.password)
	// console.log(passwordSame)
	if (!passwordSame) {
		return new Error("Wrong Password")
	}
	console.log(data.id)
	const accessToken = createAccessToken(data.id)
	const refreshToken = createRefreshToken(data.id)
	// const accessToken = jwt.sign({ id: data.id, expiery: Date.now() + accessTokenExpiry }, SECRET1)
	// const refreshToken = jwt.sign({ id: data.id, expiery: Date.now() + refreshTokenExpiery }, SECRET2)

	return {
		accessToken,
		refreshToken,
		user: data
	}
}

async function askForNewTokens(_, args, ctx) {
	const { input } = args
	// const { isRefreshTokenExpired, createAccessTokenFromRefreshToken } = utils
	let data = isRefreshTokenExpired(input)
	if (data.expired) {
		return new Error("acess Token Expired Login Again")
	} else {
		let newTokens = await createAccessTokenFromRefreshToken(input)
		// console.log(4, newTokens)
		return {
			accessToken: newTokens.accessToken,
			refreshToken: newTokens.refreshToken
		}
	}
}
module.exports = {
	signup,
	login,
	askForNewTokens
}
