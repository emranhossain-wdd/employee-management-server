const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// mysql
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "emran",
    password: "password",
    database: "employee-management"
});


async function run() {
    try {
        app.get('/employees', async (req, res) => {
            const page = req.query.page;

            pool.getConnection((err, connection) => {
                if (err) throw err
                connection.query(`SELECT * from employees LIMIT 5 OFFSET ${page * 5}`, (err, rows) => {
                    connection.release()
                    if (!err) {
                        res.send(rows)
                    } else {
                        console.log(err)
                    }
                })
            });
        })
        app.get('/searchEmployee', async (req, res) => {
            const search = req.query.search;

            pool.getConnection((err, connection) => {
                if (err) throw err
                connection.query(`SELECT * from employees WHERE email = '${search}';`, (err, rows) => {
                    connection.release()
                    if (!err) {
                        res.send(rows)
                    } else {
                        console.log(err)
                    }
                })
            });
        })
        app.get('/count', async (req, res) => {

            pool.getConnection((err, connection) => {
                if (err) throw err
                connection.query('SELECT COUNT(*) from employees', (err, rows) => {
                    connection.release()
                    if (!err) {
                        res.send(rows)
                    } else {
                        console.log(err)
                    }
                })
            });
        })
        app.post('/addEmployee', async (req, res) => {
            const { firstName, lastName, email } = req.body;
            pool.getConnection((err, connection) => {
                if (err) throw err
                connection.query(`INSERT INTO employees VALUES('${firstName}', '${lastName}', '${email}')`, (err, rows) => {
                    connection.release()
                    if (!err) {
                        res.send(rows)
                    } else {
                        console.log(err)
                    }
                })
            });
        })
        app.post('/addEmployees', async (req, res) => {
            const employeeList = [];
            const file = req.body;
            file.map(employee => employeeList.push(employee));
            const fieldVerification = employeeList.filter(data => data.length == 3 && data[0] !== '' && data[1] !== '' && data[2] !== '');
            const emailVerification = fieldVerification.filter(b => b[2].includes('@'))

            pool.getConnection((err, connection) => {
                if (err) throw err
                const sql = "INSERT INTO employees (firstName, lastName, email) VALUES ?";
                connection.query(sql, [emailVerification], (err, rows) => {
                    connection.release()
                    if (!err) {
                        res.send(rows)
                    } else {
                        console.log(err)
                    }
                })
            });
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('employee management server is running');
})

app.listen(port, () => {
    console.log(`listening at port ${port}`);
})