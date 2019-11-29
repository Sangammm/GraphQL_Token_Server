const { GraphQLServer } = require('graphql-yoga')
const { prisma } = require('../generated/prisma-client')
const fs = require('fs')
require('dotenv').config()
// const { Mutation, Query } = require("./resolvers");
const resolvers = require('./resolvers')
// const resolvers = {
//   Query: {
//     user() {
//       return {
//         id: "1231232",
//         name: "Helloji",
//         email: "heelo@ji.com"
//       };
//     }
//   }
// };

// const resolvers = {
//   Mutation,
//   Query
// };
// console.log(resolvers);

const server = new GraphQLServer({
	typeDefs: './src/schema.graphql',
	resolvers,
	context: request => ({
		...request,
		prisma
	})
})
// const httpsOptions = {
// 	key: fs.readFileSync('./server.key'),
// 	cert: fs.readFileSync('./server.cert')
// }

server.start(
	{
		// https: httpsOptions,
		port: process.env.PORT
	},
	() => console.log('server started on port https://localhost:4001')
)
