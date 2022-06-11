// const mysql = require("mysql")
const sqlite = require("sqlite3")
const { open } = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const debug = require("debug")("myapp:database")
const mysql = require("mysql")
const {ENV} = process.env;

//I can't use mysql in this public computer so I am using it as an strategy, and its also a good thing
class MYSQLStrategy {
  constructor() {
    this.connect();
  }
  connect() {
    this.connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: 'root',
      database: "db"
    });
    this.connection.connect();
    return this.connection;
  }
  query(query, callback) {
    try {
      this.connection.query(query, callback)
    } catch (err) {
      // Logger.error(err);
      callback(err)
    }
  }
}

class SQLITEStrategy {
  types = {
    id_no_increment: "INTEGER PRIMARY KEY",
    id_increment: "INTEGER PRIMARY KEY AUTOINCREMENT"
  }
  async connect() {
    debug("DATABASE CONNECTING...")
    this.connection = await open({ 
      filename: path.resolve('src', 'server', 'database', `database.${ENV.toLowerCase()}.db`),
      driver: sqlite3.Database
    })
    debug("DATABASE CONNECTION DONE");
    return this;
  }
  query(query, callback=() => {}) {
    try {
      if (query.constructor.name === "String") {
        this.connection.exec(query).then((d) => {
          callback(undefined, d);
        });
      } else if (query.constructor.name === "Object") {
        this.connection.exec(options.sql, options.values).then(d => {
          callback(undefined, d)
        })
      } else {
        throw new Error("Something is off on the sqlite's query");
      }
    } catch (err) {
      debug('SQLITE_QUERY_ERR', err)
      callback(err)
    }
  }
  select(query, callback) {
    try {
      this.connection.all(query).then(d => {
        callback(undefined, d);
      })
    } catch (err) {
      debug('SQLITE_SELECT_ERR',err.message)
      callback(err)
    }
  }
}

class Database {
  constructor() {
  }
  async connect(strategy) {
    if (this.connection)
      return this.connection

    this.st = strategy;
    return await strategy.connect().then((connection) => {
      if (!connection) {
        throw new Error("No connection")
      }
      this.connection = connection;
      this.dropTables();
      this.createTables();
      return this.connection;
    });
  }
  dropTables() {
    try {
      if (ENV === "test") {
        debug("TEST ENVIRONMENT, DROPING TABLES")
        this.connection.query('DROP TABLE IF EXISTS call_clients');
        this.connection.query('DROP TABLE IF EXISTS call_stats');
      }
    } catch (err) {
      debug("DROP_TABLES_ERR", err.message);
    }
  }
  //clientes pode ser 1 ou milhares, atentar-se para este detalhe 
  createTables() {
    debug("CREATING TABLES");
    this.connection.query(`CREATE TABLE IF NOT EXISTS call_stats (
        rowid ${this.st.types.id_increment},
        data date,
        contas_quantidade ${this.st.types.int},
        clientes varchar(10000),
        chamadas_total ${this.st.types.int},
        chamadas_telefone_incorreto ${this.st.types.int},
        chamadas_falha_operadora ${this.st.types.int},
        chamadas_nao_atendida ${this.st.types.int},
        chamadas_atendimento_maquina ${this.st.types.int},
        chamadas_atendimento_humano ${this.st.types.int},
        chamadas_atendimento_pa ${this.st.types.int},
        chamadas_abandono_pre_fila ${this.st.types.int},
        chamadas_abandono_fila ${this.st.types.int},
        ocorrencias_total ${this.st.types.int},
        ocorrencias_sem_contato ${this.st.types.int},
        ocorrencias_com_contato ${this.st.types.int},
        ocorrencias_abordagem ${this.st.types.int},
        ocorrencias_fechamento ${this.st.types.int}
      )`, (err) => {
        if (err)
          debug("Failed to create table 'call_stats'", err)
    });
    this.connection.query(`CREATE TABLE IF NOT EXISTS call_clients (
        rowid ${this.st.types.id_increment},
        id varchar(50),
        data date,
        chamadas_total ${this.st.types.int},
        chamadas_telefone_incorreto ${this.st.types.int},
        chamadas_falha_operadora ${this.st.types.int},
        chamadas_nao_atendida ${this.st.types.int},
        chamadas_atendimento_maquina ${this.st.types.int},
        chamadas_atendimento_humano ${this.st.types.int},
        chamadas_atendimento_pa ${this.st.types.int},
        chamadas_abandono_pre_fila ${this.st.types.int},
        chamadas_abandono_fila ${this.st.types.int},
        ocorrencias_total ${this.st.types.int},
        ocorrencias_sem_contato ${this.st.types.int},
        ocorrencias_com_contato ${this.st.types.int},
        ocorrencias_abordagem ${this.st.types.int},
        ocorrencias_fechamento ${this.st.types.int}
      )`, (err) => {
        if(err)
          debug("Failed to create table: 'call_clients'", err);
      })
  }
  getClientByIdAndDate(id, date) {
   return new Promise(resolve => {
     this.connection.select(`SELECT * FROM call_clients WHERE id = ${mysql.escape(id)} AND data LIKE ${mysql.escape(date+'%')};`, (err, results, fields) => {
       if (err) {
         debug("GET_STATS_ERR_1", err.message);
         return resolve({status: "ERR", err});
       }
       resolve({status:"OK", data:results});
     })
   })
  }
  getClientById(id) {
    return new Promise(resolve => {
      this.connection.select(`SELECT * FROM call_clients WHERE id = ${mysql.escape(id)};`, (err, results, fields) => {
        if (err) {
          debug("GET_STATS_ERR_1", err.message);
          return resolve({status: "ERR", err});
        }
        resolve({status:"OK", data:results});
      })
    })    
  }
  getClientsByDate(date) {
    return new Promise(resolve => {
      this.connection.select(`SELECT * FROM call_clients WHERE data LIKE ${mysql.escape(date+'%')};`, (err, results, fields) => {
        if (err) {
          debug("GET_CLIENTS_DATE_ERR", err.message);
          return resolve({status: "ERR", err});
        }
        resolve({status:"OK", data:results});
      })
    })
  }
  getClients() {
    return new Promise(resolve => {
      this.connection.select("SELECT * FROM call_clients;", (err, data) => {
        if (err) {
          debug("GET_CLIENTS_ERR",err.message)
          return resolve({status: "ERR", err})
        }
        resolve({status: "OK", data});
      });
    })
  }
  getStatsByDate(date) {
    return new Promise((resolve) => {
      this.connection.select(`SELECT * FROM call_stats WHERE data LIKE ${mysql.escape(date+'%')};`, (err, results, fields) => {
        if (err) {
          debug("GET_STATS_ERR_2", err.message);
          return resolve({status: "ERR", err});
        }
        resolve({ status:"OK", data:results });
      })
    })
  }
  getStats() {
    return new Promise((resolve) => {
      this.connection.select(`SELECT * FROM call_stats;`, (err, results, fields) => {
        if (err) {
          debug("GET_STATS_ERR_2", err.message);
          return resolve({status: "ERR", err});
        }
        resolve({ status:"OK", data:results });
      })
    })
  }
  insertCallData(data) {
    data.map(day => {
      let stats = day.geral;
      stats.data = `${stats.data} ${stats.hora}`;
      delete stats.hora;
      let fields = this._getFields(stats)
      let values = this._getValues(stats)
      this.connection.query(`INSERT INTO call_stats (${fields.join(', ')}) VALUES (${values.join(', ')});`, (err,data) => {
        if (err)
         debug("Failed to insert call_stats' data", err)
      });

      let clients = stats.clientes.split(',');
      clients.map(id => {
        let client = day.clientes[id]
        client.id = id;
        client.data = `${client.data} ${client.hora}`
        delete client.hora
        let values = this._getValues(client);
        let fields = this._getFields(client);
        this.connection.query(`INSERT INTO call_clients (${fields.join(', ')}) VALUES (${values.join(", ")});`, 
          (err,data) => {
            if (err)
             debug("Failed to insert call_clients' data", err)
        });
      })

    })
  }
  _getValues(data) {
      return Object.keys(data).map((field) => {
        return mysql.escape(data[field])
      })
  }
  _getFields(data) {
      return Object.keys(data).map(field => {
        return mysql,escape(field)
      })
  }
  handleFilters(filters, resolve) {
    if (!filters) return [];
    if (filters.length > 10) {
      debug("MAX_NUM_REACHED");
      return resolve({status:"ERR", err: "Max num of filters reached!"});
    }
    return filters.map(filter => {
      if (!filter) return '';
      if (filter.constructor.name !== "String") return '';
      filter = mysql.escape(filter)
    });
  }
}



module.exports = {
  Database,
  SQLITEStrategy,
  MYSQLStrategy
}