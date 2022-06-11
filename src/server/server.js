const path = require("path")
require("dotenv").config({path: path.resolve('src/server/.env')});
const expressF = require("express")
const fs = require("fs")
const bodyParser = require("body-parser");
const axios = require("axios")
const debug = require("debug")("server")
const {Database, MYSQLStrategy, SQLITEStrategy} = require("./database.js")
const {ENV} = process.env;

const SITE = "website.com";
const PORT = 3000;

const dist = (...rest) => {
  return path.resolve("dist", ...rest)
}
const HTML = fs.readFileSync(dist("index.html"),'utf8')

const app = expressF();
app.use(expressF.static(dist()))
app.use(bodyParser.json())
app.use((req,res,next) => {
 res.setHeader("Access-Control-Allow-Origin", "*");
 next();
})
async function getCallData() {
  let callData;

  // tests
  if (ENV === 'test') {
   return JSON.parse(fs.readFileSync(path.resolve('src/server/dados.json'))); 
  }
  
   
  let { data, response } = await axios.get(SITE).catch((err) => {
    debug('Failed to fetch from %s', SITE, err)
  });
  if (!data)
    throw new Error("Couldn't fetch call data from remote.");
  callData = data;

  return callData
}

async function init() {
  const sqliteStrategy = new SQLITEStrategy();
  // const mysqlStrategy = new MYSQLStrategy();
  global.db = new Database(sqliteStrategy);
  await db.connect(sqliteStrategy);

  let callData = await getCallData();
  db.insertCallData(callData);

  //{allColumns}}
  app.get('/getClientsByDate/:date', async (req,res) => {
    let result = await db.getClientsByDate(req.params.date);
    if (result.status === "ERR")
      return res.status(500).send({status: "ERR", message: "Failed to get clients by date"});
    res.send(result);
  });
  //{rowid, id, quantia}
  app.get("/getClients", async (req,res) => {
    let result = await db.getClients();
    if (result.status === "ERR")
      return res.status(500).send({status: "ERR", message: "Failed to get clients"});
    res.send(result);
  });
  //{allColumns}
  app.get("/getStats", async (req,res) => {
    let result = await db.getStats();
    if (result.status === "ERR")
      return res.status(500).send({status: "ERR", message: "Failed to get stats"});
    res.send(result);
  })
  //{allColumns}
  app.get("/getStatsByDate/:date", async (req, res) => {
    let result = await db.getStatsByDate(req.params.date);
    if (result.status === "ERR")
      return res.status(500).send({status: "ERR", message: "Failed to get stats by date"});
    res.send(result);
  })
  
  app.use((err,req,res,next) => {
    debug('errorHandler caught:',err);
    res.status(500).send({status:"ERR",message:"Something happened!"});
    next(err);
  })

  app.get('*', (req,res) => {
    res.setHeader("Content-Type", "text/html");
    if (ENV === 'production')
     res.send(HTML);
    else
     res.send(fs.readFileSync(dist("index.html"),'utf8'));
  })

  app.listen(PORT, () => {
    console.log('App listening on port', PORT);
  })
}

init();