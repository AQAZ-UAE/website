const mysql = require('mysql2/promise');

async function test() {
    try {
        console.log('Attempting to connect to MySQL...');
        const con = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        console.log('Connected successfully!');
        const [rows] = await con.query('SHOW DATABASES');
        console.log('Databases:', rows.map(r => r.Database));
        await con.end();
    } catch (err) {
        console.error('Connection failed!');
        console.error(err);
    }
}

test();
