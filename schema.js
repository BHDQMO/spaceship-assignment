const { pool } = require('./models/mysql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString
} = require("graphql");

const CommentType = new GraphQLObjectType({
  name: 'Comment',
  description: '...',

  fields: () => ({
    content: {
      type: GraphQLString,
      resolve: commentResult => commentResult.content
    },
    author: {
      type: UserType,
      resolve: async (commentResult, args, context) => {
        return context.userDataLoader.load(commentResult.author)
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  description: '...',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: userResult => userResult.author || userResult.name
    },
    avatar: {
      type: GraphQLString,
      resolve: userResult => userResult.avatar
    }
  })
})

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: bookResult => bookResult.name
    },
    author: {
      type: UserType,
      resolve: bookResult => bookResult
    },
    publishDate: {
      type: GraphQLString,
      resolve: bookResult => new Date(bookResult.publish_date).toISOString().split('T')[0]
    },
    commentNum: {
      type: GraphQLInt,
      resolve: async (bookResult, args, context) => {
        return context.commentNumDataLoader.load(bookResult.id)
      }
    },
    comment: {
      type: new GraphQLList(CommentType),
      resolve: async (bookResult, args, context) => {
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
        resolve: async (root, args) => {
          let querySting = `
          SELECT bookTemp.id AS id, bookTemp.name AS name, user.name AS author, publish_date, avatar FROM
          (SELECT * FROM book WHERE id = ? ) AS bookTemp
          JOIN user
          ON bookTemp.author = user.id
          `
          const [[result]] = await pool.query(querySting, [args.id])
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
        resolve: async (root, args) => {
          let querySting = `
            SELECT bookTemp.id AS id, bookTemp.name AS name, userTemp.name AS author, publish_date, avatar FROM 
            ( SELECT * FROM book WHERE book.name LIKE ? ) AS bookTemp 
            JOIN
            ( SELECT * FROM user WHERE user.name LIKE ? ) AS userTemp 
            ON bookTemp.author = userTemp.id
            WHERE bookTemp.name LIKE ? OR userTemp.name LIKE ?
          `
          let queryBinding = [
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
          if (!args.pagination) {
            paginationQuerySting = ' LIMIT 0 , 60'
          } else {
            paginationQuerySting = ' LIMIT ? , 10'
            queryBinding.push(args.pagination * 10)
          }

          querySting += orderQuerySting
          querySting += paginationQuerySting

          // console.log(pool.format(querySting, queryBinding))
          const [result] = await pool.query(querySting, queryBinding)
          return result
        }
      },
    })
  })
})