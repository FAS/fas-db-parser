import intel from 'intel'

intel.config({
  formatters: {
    simple: {
      format: '[%(date)s][%(levelname)s] %(name)s: %(message)s',
      colorize: true
    },
    file: {
      format: '[%(date)s][%(levelname)s] %(name)s: %(message)s',
      colorize: false
    }
  },
  handlers: {
    console: {
      level: intel.VERBOSE,
      class: intel.handlers.Console,
      formatter: 'simple'
    },
    errors: {
      level: intel.ERROR,
      class: intel.handlers.File,
      formatter: 'file',
      file: './logs/error.log'
    },
    warnings: {
      level: intel.WARN,
      class: intel.handlers.File,
      formatter: 'file',
      file: './logs/warnings.log'
    }
  },
  loggers: {
    klpt: {
      level: intel.DEBUG,
      handlers: ['console', 'errors', 'warnings'],
      propagate: true
    }
  }
})

export default intel
