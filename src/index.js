const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("../generated/prisma-client");
// const { Mutation, Query } = require("./resolvers");
const resolvers = require("./resolvers");
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
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: request => ({
    ...request,
    prisma
  })
});

server.start(
  {
    port: 4001
  },
  () => console.log("server started")
);
