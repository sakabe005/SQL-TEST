import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;


app.use(cors());
app.use(express.static('public'));

app.get('/data', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'kobe'
    });

    const [rows, fields] = await conn.query('SELECT * FROM eurf310005_2013 WHERE age >= 50 LIMIT ? OFFSET ?', [limit, offset]);
    await conn.end();

    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).send('Server Error');
  }
});

app.get('/gender-ratio', async (req, res) => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'kobe'
    });

    const [rows, fields] = await conn.query(`
      SELECT sex, COUNT(*) as count
      FROM eurf310005_2013
      WHERE age >= 50
      GROUP BY sex
    `);
    await conn.end();

    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
