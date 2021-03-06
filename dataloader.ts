const { pool } = require('./models/mysql')

const userBatchFunction = async (userId: number) => {
  const [[result]] = await pool.query(`SELECT * FROM user WHERE id = ?`, [userId])
  return result
}

const commentBatchFunction = async (bookId: number) => {
  const [commentResult] = await pool.query(`SELECT * FROM comment WHERE book = ?`, [bookId])
  return commentResult
}

const commentNumBatchFunction = async (bookId: number) => {
  const [[result]] = await pool.query(`SELECT COUNT(id) AS commentNum FROM comment WHERE book = ?`, [bookId])
  return result.commentNum
}


module.exports = {
  userBatchFunction,
  commentBatchFunction,
  commentNumBatchFunction
}
export { }