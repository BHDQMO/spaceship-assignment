const { pool } = require('./models/mysql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString
} = require("graphql");

interface CommentResult {
  id: number
  content: string
  author: string
  book: number
}

interface UserResult {
  id: number
  author: string
  name: string
  avatar: string
}

interface BookResult {
  id: number
  name: string
  publish_date: string
  author: string
}

interface BookAgs {
  id: number
}

interface BooksAgs {
  pagination: number
  bookName: string
  authorName: string
  keyword: string
  nameSort: string
  publishSort: string
}

interface Context {
  userDataLoader: any
  commentDataLoader: any
  commentNumDataLoader: any
}

const CommentType = new GraphQLObjectType({
  name: 'Comment',
  description: '...',

  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: (commentResult: CommentResult) => commentResult.id
    },
    content: {
      type: GraphQLString,
      resolve: (commentResult: CommentResult) => commentResult.content
    },
    author: {
      type: UserType,
      resolve: async (commentResult: CommentResult, args: any, context: Context) => {
        return context.userDataLoader.load(commentResult.author)
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  description: '...',

  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: (userResult: UserResult) => userResult.id
    },
    name: {
      type: GraphQLString,
      resolve: (userResult: UserResult) => userResult.author || userResult.name
    },
    avatar: {
      type: GraphQLString,
      resolve: (userResult: UserResult) => userResult.avatar
    }
  })
})

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',

  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve: (bookResult: BookResult) => bookResult.id
    },
    name: {
      type: GraphQLString,
      resolve: (bookResult: BookResult) => bookResult.name
    },
    author: {
      type: UserType,
      resolve: (bookResult: BookResult) => bookResult
    },
    publishDate: {
      type: GraphQLString,
      resolve: (bookResult: BookResult) => new Date(bookResult.publish_date).toISOString().split('T')[0]
    },
    commentNum: {
      type: GraphQLInt,
      resolve: async (bookResult: BookResult, args: any, context: Context) => {
        return context.commentNumDataLoader.load(bookResult.id)
      }
    },
    comment: {
      type: new GraphQLList(CommentType),
      resolve: async (bookResult: BookResult, args: any, context: Context) => {
        return context.commentDataLoader.load(bookResult.id)
      }
    },
  })
})

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
      book: {
        type: BookType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: async (root: any, ags: BookAgs) => {
          let querySting = `
          SELECT bookTemp.id AS id, bookTemp.name AS name, user.name AS author, publish_date, avatar FROM
          (SELECT * FROM book WHERE id = ? ) AS bookTemp
          JOIN user
          ON bookTemp.author = user.id
          `
          const [[result]] = await pool.query(querySting, [ags.id])
          return result
        }
      },
      books: {
        type: GraphQLList(BookType),
        args: {
          pagination: { type: GraphQLInt },
          bookName: { type: GraphQLString },
          authorName: { type: GraphQLString },
          keyword: { type: GraphQLString },
          nameSort: { type: GraphQLString },
          publishSort: { type: GraphQLString },
        },
        resolve: async (root: any, args: BooksAgs) => {
          let querySting = `
            SELECT bookTemp.id AS id, bookTemp.name AS name, userTemp.name AS author, publish_date, avatar FROM 
            ( SELECT * FROM book WHERE book.name LIKE ? ) AS bookTemp 
            JOIN
            ( SELECT * FROM user WHERE user.name LIKE ? ) AS userTemp 
            ON bookTemp.author = userTemp.id
            WHERE bookTemp.name LIKE ? OR userTemp.name LIKE ?
          `
          let queryBinding: Array<any> = [
            `%${args.bookName || ''}%`,
            `%${args.authorName || ''}%`,
            `%${args.keyword || ''}%`,
            `%${args.keyword || ''}%`
          ]

          let orderQuerySting
          if (!args.nameSort && !args.publishSort) {
            orderQuerySting = ''
          } else {
            orderQuerySting = 'ORDER BY '
            if (args.nameSort !== undefined && args.publishSort !== undefined) {
              orderQuerySting += 'bookTemp.name ' + args.nameSort
              orderQuerySting += ', '
              orderQuerySting += 'bookTemp.publish_date ' + args.publishSort
            } else if (args.nameSort !== undefined) {
              orderQuerySting += 'bookTemp.name ' + args.nameSort
            } else if (args.publishSort !== undefined) {
              orderQuerySting += 'bookTemp.publish_date ' + args.publishSort
            }
          }

          let paginationQuerySting
          if (args.pagination === undefined) {
            paginationQuerySting = ' LIMIT 0 , 60'
          } else {
            paginationQuerySting = ' LIMIT ? , 10'
            queryBinding.push(args.pagination * 10)
          }

          querySting += orderQuerySting
          querySting += paginationQuerySting

          const [result] = await pool.query(querySting, queryBinding)
          return result
        }
      },
    })
  })
})