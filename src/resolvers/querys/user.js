const { validateReq } = require('../../utils')

async function users(_, args, ctx) {
	const userId = await validateReq(ctx)
	if (!userId) {
		return
	}
	let data = await ctx.prisma.users()
	return {
		users: data,
		TokenInfo: userId
	}
}
module.exports = {
	users
}
