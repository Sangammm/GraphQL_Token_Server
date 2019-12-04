const { validateReq } = require('../../utils')

async function users(_, args, ctx) {
	// const TokenInfo = await validateReq(ctx)
	let data = await ctx.prisma.users()
	return {
		users: data
		// TokenInfo
	}
}
module.exports = {
	users
}
