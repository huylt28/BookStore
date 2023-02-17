const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
// const { gql, useMutation } = require("@apollo/client");
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Library {
    branch: String!
    books: [Book!]
  }

  # A book has a title and author
  type Book {
    title: String
    author: String
    branch: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    libraries: [Library]
  }
   # return Book
  type Mutation {
    addBook(title: String!, author: String , branch: String): Book 
  }
 
`;

const libraries = [
  {
    branch: "downtown",
  },
  {
    branch: "riverside",
  },
];

// The branch field of a book indicates which library has it in stock
const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
    branch: "riverside",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
    branch: "downtown",
  },
  {
    title: "City of Fire",
    author: "Paul Auaasdasdasdsadster",
    branch: "downtown",
  },
];

// Resolver map
const resolvers = {
  Query: {
    libraries() {
      // Return our hardcoded array of libraries
      return libraries;
    },
  },

  Mutation: {
    addBook: (parent, args, context, info) => {
      try {
        const exist = libraries.some((item) => item.branch === args.branch);

        if (!exist) {
          libraries.push({ branch: args.branch });

          books.push({
            title: args.title,
            author: args.author,
            branch: args.branch,
          });
        }
        return { title: args.title, author: args.author, branch: args.branch };
      } catch (error) {
        console.log(error);
      }
    },
  },

  Library: {
    books(parent) {
      // Filter the hardcoded array of books to only include
      // books that are located at the correct branch
      return books.filter((book) => book.branch === parent.branch);
    },
  },
  // Book: {
  //   // The parent resolver (Library.books) returns an object with the
  //   // author's name in the "author" field. Return a JSON object containing
  //   // the name, because this field expects an object.
  //   author(parent) {
  //     return {
  //       name: parent.author,
  //     };
  //   },
  // },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => console.log(`🚀  Server ready at: ${url}`));
