const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// function getRandomString() {
//   return Math.random()
//     .toString(36)
//     .substring(10);
// }
const SECRET1 = process.env.SECRET1;
const SECRET2 = process.env.SECRET2;
const acessTokenExpiry = 100 * 60 * 10; //10 minutes
const refreshTokenExpiery = 100 * 60 * 60 * 24 * 1; // one day

async function signup(_, args, ctx) {
  // console.log(args.input.email);
  const { email, name, password } = args.input;
  let obj = {};
  obj.email = email;
  obj.name = name;
  obj.password = await bcrypt.hash(password, 10);
  let data = await ctx.prisma.createUser({ ...obj });
  console.log(data);
  const acessToken = await jwt.sign(
    { id: data.id, expiery: Date.now() + acessTokenExpiry },
    SECRET1
  );
  const refreshToken = await jwt.sign(
    {
      id: data.id,
      expiery: Date.now() + refreshTokenExpiery
    },
    SECRET2
  );

  return {
    acessToken,
    refreshToken,
    data
  };
}

async function login(_, args, ctx) {
  return {
    acessToken: "HolOn",
    refreshToken: "HolOn",
    data: "HolOn"
  };
}
module.exports = {
  signup,
  login
};
