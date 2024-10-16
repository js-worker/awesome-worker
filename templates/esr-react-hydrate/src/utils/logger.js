class Logger {
  log(message) {
    console.log(JSON.stringify(message, null, 2));
  }

  error(message) {
    console.error(JSON.stringify(message, null, 2));
  }
}

const logger = new Logger();
export default logger;
