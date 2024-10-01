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
    const queryType = req.query.query || 'default';
    const gender = req.query.gender || '';
    const region = req.query.region || '';
    let query = '';
    if( gender!=='' && region!=='')
      {
      query = `
        SELECT FLOOR(age / 10) * 10 AS age_group, SUM(value) as count, '${queryType}' as year
        FROM eurf310005_${queryType}
        WHERE yyyymm = '${queryType}01' AND sex = '${gender}' AND area = '${region}'
        GROUP BY age_group
        ORDER BY age_group
      `;
    }
    else if( gender==='' && region!==''){
      query = `
        SELECT FLOOR(age / 10) * 10 AS age_group, SUM(value) as count, '${queryType}' as year
        FROM eurf310005_${queryType}
        WHERE yyyymm = '${queryType}01' AND area = '${region}'
        GROUP BY age_group
        ORDER BY age_group
      `;
    }
    else if( gender!=='' && region===''){
      query = `
        SELECT FLOOR(age / 10) * 10 AS age_group, SUM(value) as count, '${queryType}' as year
        FROM eurf310005_${queryType}
        WHERE yyyymm = '${queryType}01' AND  sex = '${gender}'
        GROUP BY age_group
        ORDER BY age_group
      `;
    }
    else if( gender==='' && region===''){
      query = `
        SELECT FLOOR(age / 10) * 10 AS age_group, SUM(value) as count, '${queryType}' as year
        FROM eurf310005_${queryType}
        WHERE yyyymm = '${queryType}01'
        GROUP BY age_group
        ORDER BY age_group
      `;
    }
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'kobe'
    });

    const [rows, fields] = await conn.query(query);
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: err.message });
  }
});





app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
