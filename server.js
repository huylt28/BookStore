const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { JsonDB, Config } = require("node-json-db");
const { v4: uuid } = require("uuid");

var db = new JsonDB(new Config("db", true, false, "/"));

const typeDefs = `
    type Category {
        id: String
        name: String
        active: Boolean
    }

    type Author {
        id: String
        name: String
    }

    type Book {
        id: String
        title: String!
        categoryId: String!
        authorId: String!
        publishDate: String
    }

    

    input InputCategory {
      name: String!
      active: Boolean
    }

    input InputAuthor {
      name: String!
    }

    input InputBook {
      title: String!
      categoryId: String!
      authorId: String!
      publishDate: String
    }

    input updateAuthor {
      authorId: String!,
      name: String!
    }

    input deleteAuthor {
      authorId: String!,
    }

    input InputAuthorName {
      name: String!
    }

    type Query {
      categoires: [Category]
      authors: [Author]
      books: [Book]
      search_author_name(input: InputAuthorName!): [Author]
      search_author_book(input: InputAuthorName!): [Book]
  }

    type Mutation {
      category(input: InputCategory!): Category
      author(input: InputAuthor!): Author
      book(input: InputBook!): Book
      update_author(input: updateAuthor!): Author
      delete_author(input: deleteAuthor!): Author
    }
`;

const resolvers = {
  Query: {
    async categoires() {
      const categoires = await db.getData("/categories");
      return categoires;
    },
    async authors() {
      const authors = await db.getData("/authors");
      return authors;
    },
    async books() {
      const books = await db.getData("/books");
      return books;
    },
    async search_author_name(_root, args) {
      const {
        input: { name },
      } = args;
      const author = await db.getData("/authors");
      const authorName = author.filter((item) => item.name === name);
      console.log(authorName);

      return authorName;
    },
    async search_author_book(_root, args) {
      const {
        input: { name },
      } = args;
      const authorData = await db.getData("/authors");
      const author = authorData.find((item) => item.name === name);

      const bookData = await db.getData("/books");
      const books = bookData.filter((item) => item.authorId === author.id);
      return books;
    },
  },
  Mutation: {
    async category(_root, args) {
      const {
        input: { name, active },
      } = args;

      const category = { id: uuid(), name, active };
      const categoires = await db.getData("/categories");
      categoires.push(category);
      await db.push("/categories", categoires);

      return category;
    },

    async author(_root, args) {
      const {
        input: { name },
      } = args;
      const author = { id: uuid(), name };
      const authors = await db.getData("/authors");
      authors.push(author);
      await db.push("/authors", authors);

      return author;
    },

    async book(_root, args) {
      const {
        input: { title, categoryId, authorId, publishDate },
      } = args;
      const book = {
        id: uuid(),
        title,
        categoryId,
        authorId,
        publishDate,
      };
      const books = await db.getData("/books");
      books.push(book);
      await db.push("/books", books);

      return book;
    },

    async update_author(_root, args) {
      const {
        input: { authorId, name },
      } = args;
      const author = await db.getData("/authors");
      let updateAuthor = author.find((item) => item.id === authorId);
      updateAuthor.name = name;
      await db.save("/authors", updateAuthor);

      return updateAuthor;
    },

    async delete_author(_root, args) {
      const {
        input: { authorId },
      } = args;

      const index = await db.getIndex("/authors", authorId);
      index !== -1 && (await db.delete(`/authors[${index}]`));

      return index;
    },
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => console.log(`🚀  Server ready at: ${url}`));
