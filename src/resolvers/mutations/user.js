const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// function getRandomString() {
//   return Math.random()
//     .toString(36)
//     .substring(10);
// }

async function signup(_, args, ctx) {
	// console.log(args.input.email);
	const { email, name, password } = args.input;
	let obj = {};
	obj.email = email;
	obj.name = name;
	obj.password = await bcrypt.hash(password, 10);
	let data = await ctx.prisma.createUser({ ...obj });
	console.log(data);
	const acessToken = await jwt.sign({ id: data.id, expiery: Date.now() + acessTokenExpiry }, SECRET1);
	const refreshToken = await jwt.sign({ id: data.id, expiery: Date.now() + refreshTokenExpiery }, SECRET2);

	return {
		acessToken,
		refreshToken,
		user: data
	};
}

async function login(_, args, ctx) {
	const { email, password } = args.input;
	let data = await ctx.prisma.user({ email });
	if (!data) {
		return new Error("Looks like you are not registered please sign up");
	}
	console.log(data.password, password);

	let passwordSame = await bcrypt.compare(password, data.password);
	console.log(passwordSame);

	if (!passwordSame) {
		return new Error("Wrong Password");
	}
	const acessToken = await jwt.sign({ id: data.id, expiery: Date.now() + acessTokenExpiry }, SECRET1);
	const refreshToken = await jwt.sign({ id: data.id, expiery: Date.now() + refreshTokenExpiery }, SECRET2);

	return {
		acessToken,
		refreshToken,
		user: data
	};
}
module.exports = {
	signup,
	login
};
