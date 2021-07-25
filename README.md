# spaceship-assignment

## Summary

- use AWS RDS as the database
- use dataloader to batch and cache data per request
- to run the server, please clone the repo, then run `docker compose up` in the terminal

## End Point

localhost:3000/graphql

## Query
- book

| arg | type       | description | note                    |
| --- | ---------- | ----------- | ----------------------- |
| id  | GraphQLInt | book id     | from 1 to 100, required |

- books

without any arg, there will be 60 items shown ( due to the maximum connection number constraints of my RDS )

| arg         | type          | description                         | note                      |
| ----------- | ------------- | ----------------------------------- | ------------------------- |
| pagination  | GraphQLInt    | the page of result                  | 10 items per page, from 0 |
| bookName    | GraphQLString | search by book name                 |                           |
| authorName  | GraphQLString | search by author name               |                           |
| keyword     | GraphQLString | search by book name and author name |                           |
| nameSort    | GraphQLString | sort by book name                   | `DESC` or `ASC`           |
| publishSort | GraphQLString | sort by book publish date           | `DESC` or `ASC`           |
