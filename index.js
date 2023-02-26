
const PORT = 3500;
const express = require('express')
const app = express();

const data = require('./data')

app.get("/api/spielplan", async (req, res) => {

    let t = req.query.t;
        try {
          const values = await data.data(t);
          var returnValues = values.filter(v => v && v.length > 0);
          res.setHeader('Access-Control-Allow-Origin','*')
          return res.status(200).json({
            returnValues,
          });
        } catch (err) {
          return res.status(500).json({
            err: err.toString(),
          });
        }
    });

app.listen(PORT, () =>
    console.log(`The server is active and running on port ${PORT}`)
);
