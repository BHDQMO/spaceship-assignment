const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const DataLoader = require('dataloader');

const app = express()

const schema = require('./schema')
const {
  userBatchFunction,
  commentBatchFunction,
  commentNumBatchFunction
} = require('./dataloader')

app.use('/graphql', graphqlHTTP(req => {
  const userDataLoader = new DataLoader(keys => Promise.all(keys.map(userBatchFunction)))
  const commentDataLoader = new DataLoader(keys => Promise.all(keys.map(commentBatchFunction)))
  const commentNumDataLoader = new DataLoader(keys => Promise.all(keys.map(commentNumBatchFunction)))
  return {
    schema,
    context: {
      userDataLoader,
      commentDataLoader,
      commentNumDataLoader
    },
    graphiql: true // graph"i"ql

  }
}))

app.listen(3000, () => {
  console.log('Server is running')
})

