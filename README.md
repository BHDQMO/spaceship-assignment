# spaceship-assignment

## Summary

- use AWS RDS as the database
- use dataloader to batch and cache data per request
- to run the server, please clone the repo, then run `docker compose up` in the terminal

## End Point

localhost:3000/graphql

## Type

```graphql
type Query {
  book(id: ID!): Book
  books(
    pagination: Int, 
    bookName: String, 
    authorName: String, 
    keyword: String, 
    nameSort: String, 
    publishSort: String): [Book]!
}

type Book {
  id: ID!
  name: String!
  author: User!
  publishDate: String!
  commentNum: Int!
  comment: [Comment]!
}

type User {
  id: ID!
  name: String!
  avatar: String!
}

type Comment {
  id: ID!
  content: String!
  author: User!
}
```

## Argument
- book

| arg | type | description | note                    |
| --- | ---- | ----------- | ----------------------- |
| id  | ID   | book id     | from 1 to 100, required |

- books

without any arg, there will be 60 items shown ( due to the maximum connection number constraints of my RDS )

| arg         | type   | description                         | note                      |
| ----------- | ------ | ----------------------------------- | ------------------------- |
| pagination  | Int    | the page of result                  | 10 items per page, from 0 |
| bookName    | String | search by book name                 |                           |
| authorName  | String | search by author name               |                           |
| keyword     | String | search by book name and author name |                           |
| nameSort    | String | sort by book name                   | `DESC` or `ASC`           |
| publishSort | String | sort by book publish date           | `DESC` or `ASC`           |
