import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;


app.use(cors());
app.use(express.static('public'));


app.get('/age-distribution-by-year', async (req, res) => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'kobe'
    });

    const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];
    const results = [];

    for (const year of years) {
      const [rows, fields] = await conn.query(`
        SELECT FLOOR(age / 10) * 10 AS age_group, SUM(value) as count, '${year}' as year
        FROM eurf310005_${year}
        GROUP BY age_group
        ORDER BY age_group
      `);
      results.push(...rows);
    }

    await conn.end();
    res.json(results);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).send('Server Error');
  }
});




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
