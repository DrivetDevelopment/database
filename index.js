const mysql = require('mysql');
const config = require('config').util.toObject();
const CatLoggr = require('cat-loggr');
const console = new CatLoggr();

const { EventEmitter } = require('eventemitter3');

/**
 * The MySQL database handler
 */
module.exports = class Database extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.reconnectAfterClose = true;
    console.log('MySQL initialized');
  }

  /**
   * Creates a client and connects to the database
   * @param {Object} options
   */
  connect({ host = "localhost", user, password, database, port = "3306" }) {
    return new Promise((resolve, reject) => {
      this.mysql = mysql.createConnection({ 
        host: host, 
        user: user, 
        password: password, 
        database: database, 
        port: port,
        charset: 'utf8mb4_unicode_ci'
      });

      this.mysql.on('error', this.onError.bind(this));
      this.mysql.on('warning', w => console.warn('MySQL Warning', w));
      this.mysql.on('end', () => this.onClose.bind(this));
      this.mysql.on('reconnecting', () => console.warn('Reconnecting to MySQL...'));
      this.mysql.on('ready', () => console.info('MySQL client ready.'));
      this.mysql.on('connect', () => console.info('MySQL connection has started.'));

      this.host = host;
      this.user = user;
      this.password = password;
      this.database = database;
      this.port = port;

      this.mysql.connect()
    });
  }

  query(sql, func) {
    return new Promise((resolve, reject) => {
      this.mysql.query(sql, func, function(error, results, fields) {
        if (error) {
          console.error(error.sqlMessage);
          return reject(new Error(error));
        }

        resolve(results);
      });
    });
  }

  rowQuery(sql, func) {
    return new Promise((resolve, reject) => {
      this.mysql.query(sql, func, function(error, results, fields) {
        if (error) {
          console.error(error.sqlMessage);
          return reject(new Error(error));
        }

        resolve(Object.values(JSON.parse(JSON.stringify(results)))[0]);
      });
    });
  }

  rowsQuery(sql, func) {
    return new Promise((resolve, reject) => {
      this.mysql.query(sql, func, function(error, results, fields) {
        if (error) {
          console.error(error.sqlMessage);
          return reject(new Error(error));
        }

        resolve(Object.values(JSON.parse(JSON.stringify(results))));
      });
    });
  }

  // #endregion

  /**
   * Reconnects the client
   */
  async reconnect() {
    console.warn('Attempting MySQL reconnection');
    this.conn = await this.connect(this);
  }

  /**
   * Disconnects the client
   */
  disconnect() {
    this.reconnectAfterClose = false;
    return new Promise(resolve => {
      this.mysql.once('end', resolve);
      this.mysql.end();
    });
  }

  /**
   * @private
   */
  onError(err) {
    console.error('MySQL Error', err);
    this.emit('error', err);
  }

  /**
   * @private
   */
  async onClose() {
    console.error('MySQL closed');
    this.emit('close');
    if (this.reconnectAfterClose) await this.reconnect();
  }
};