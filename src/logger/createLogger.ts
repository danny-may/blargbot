import { Configuration } from '@blargbot/config/Configuration';
import * as Sentry from '@sentry/node';
import CatLoggr, { ArgHookCallback, Color, LogLevel as CatLogLevel, PreHookCallback } from 'cat-loggr/ts';

import { Logger, LogLevel } from './Logger';

export function createLogger(config: Configuration, workerId: string): Logger {
    const logger = new CatLoggr({
        shardId: workerId,
        level: config.general.loglevel,
        shardLength: 6,
        levels: Object.entries(logLevels).map(([l, { color, isError, isTrace }]) => {
            const level = new CatLogLevel(l, <Color><unknown>color);
            level.err = isError ?? false;
            level.trace = isTrace ?? false;
            return level;
        })
    });

    if (config.sentry.base !== '')
        logger.addPreHook(createSentryPreHook(config, workerId) as unknown as ArgHookCallback);

    const _logger = logger as unknown as Logger;

    const setGlobal = _logger.setGlobal.bind(logger);
    _logger.setGlobal = function (...args) {
        _logger.setGlobal = setGlobal;
        const res = _logger.setGlobal(...args);

        process.on('uncaughtExceptionMonitor', ex => _logger.error('Uncaught exception', ex));
        return res;
    };

    return _logger;
}

const logLevels: Record<LogLevel, { color: typeof CatLoggr['_chalk']; isError?: boolean; isTrace?: boolean; }> = {
    fatal: { color: CatLoggr._chalk.red.bgBlack, isError: true },
    error: { color: CatLoggr._chalk.black.bgRed, isError: true },
    warn: { color: CatLoggr._chalk.black.bgYellow, isError: true },
    website: { color: CatLoggr._chalk.black.bgCyan },
    ws: { color: CatLoggr._chalk.yellow.bgBlack },
    cluster: { color: CatLoggr._chalk.black.bgMagenta },
    worker: { color: CatLoggr._chalk.black.bgMagenta },
    command: { color: CatLoggr._chalk.black.bgBlue },
    shardi: { color: CatLoggr._chalk.blue.bgYellow },
    init: { color: CatLoggr._chalk.black.bgBlue },
    info: { color: CatLoggr._chalk.black.bgGreen },
    trace: { color: CatLoggr._chalk.green.bgBlack, isTrace: true },
    output: { color: CatLoggr._chalk.black.bgMagenta },
    bbtag: { color: CatLoggr._chalk.black.bgGreen },
    adebug: { color: CatLoggr._chalk.cyan.bgBlack },
    debug: { color: CatLoggr._chalk.magenta.bgBlack },
    middleware: { color: CatLoggr._chalk.magenta.bgBlack },
    log: { color: CatLoggr._chalk.magenta.bgBlack },
    dir: { color: CatLoggr._chalk.magenta.bgBlack },
    verbose: { color: CatLoggr._chalk.black.bgCyan },
    database: { color: CatLoggr._chalk.black.bgBlue },
    module: { color: CatLoggr._chalk.black.bgBlue }
};

function createSentryPreHook(config: Configuration, workerId: string): PreHookCallback {
    Sentry.init({
        dsn: config.sentry.base,
        environment: config.general.isProd !== true ? 'development' : 'production',
        integrations: [
            new Sentry.Integrations.Http({ tracing: true })
        ],
        tracesSampleRate: config.sentry.sampleRate
    });

    Sentry.setTag('worker', workerId);
    return (...args) => sentryPreHook(...args);
}

function sentryPreHook(...[{ error: isError, args, level, context, shard }]: Parameters<PreHookCallback>): null {
    if (!isError)
        return null;

    args = [...args as unknown[]];
    const error = args.find((v): v is Error => v instanceof Error)
        ?? args.splice(0, args.length).join(' ');

    Sentry.withScope(scope => sendToSentry(scope, <Sentry.Severity>level, error, {
        ...context,
        shard: shard,
        args
    }));

    return null;
}

function sendToSentry(scope: Sentry.Scope, level: Sentry.Severity, error: string | Error, context: object): void {
    scope.setLevel(level);
    Sentry.captureException(error, context);
}