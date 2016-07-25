import intel from 'intel'

intel.config({
  formatters: {
    'simple': {
      'format': '[%(date)s][%(levelname)s] %(name)s: %(message)s',
      'colorize': true
    }
  },
  handlers: {
    'terminal': {
      'class': intel.handlers.Console,
      'formatter': 'simple',
      'level': intel.INFO
    }
  },
  loggers: {
    'klpt': {
      'handlers': ['terminal'],
      'handleExceptions': true,
      'exitOnError': true,
      'propagate': true
    }
  }
})

export default intel
