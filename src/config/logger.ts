import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      destination: './logs/app.log',
      translateTime: 'SYS:standard',
      colorize: false,
      mkdir: true,
    },
  },
});

export default logger;
