import { Logger } from '@core/Logger';
import { Duration, duration, DurationInputArg1, DurationInputArg2 } from 'moment-timezone';
import { inspect } from 'util';

import { BaseService } from './BaseService';

export abstract class IntervalService extends BaseService {
    /* eslint-disable @typescript-eslint/explicit-member-accessibility */
    #interval?: NodeJS.Timeout;
    readonly #execute: () => void;
    /* eslint-enable @typescript-eslint/explicit-member-accessibility */

    public readonly period: Duration;
    public readonly logger: Logger;
    private readonly immediate: boolean;

    protected constructor(period: DurationInputArg1, logger: Logger);
    protected constructor(period: DurationInputArg1, logger: Logger, immediate: boolean);
    protected constructor(period: DurationInputArg1, unit: DurationInputArg2, logger: Logger);
    protected constructor(period: DurationInputArg1, unit: DurationInputArg2, logger: Logger, immediate: boolean);
    protected constructor(...args:
        | [period: DurationInputArg1, logger: Logger]
        | [period: DurationInputArg1, logger: Logger, immediate: boolean]
        | [period: DurationInputArg1, unit: DurationInputArg2, logger: Logger]
        | [period: DurationInputArg1, unit: DurationInputArg2, logger: Logger, immediate: boolean]) {
        super();

        const [period, unit, logger, immediate] = mapArgs(args);
        this.period = duration(period, unit);
        this.logger = logger;
        this.immediate = immediate ?? false;

        this.#execute = async () => {
            try {
                this.logger.debug(`Executing Interval ${this.name}`);
                await this.execute();
            } catch (err: unknown) {
                this.logger.error(`Interval ${this.name} threw an error: ${inspect(err)}`);
            }
        };
    }

    public abstract execute(): Promise<void> | void;

    public start(): void {
        if (this.#interval !== undefined)
            throw new Error(`Interval ${this.name} is already running`);

        this.#interval = setInterval(this.#execute, this.period.asMilliseconds());
        if (this.immediate)
            this.#execute();
    }

    public stop(): void {
        if (this.#interval === undefined)
            throw new Error(`Interval ${this.name} is not running`);

        clearInterval(this.#interval);
        this.#interval = undefined;
    }
}

function mapArgs(args:
    | [period: DurationInputArg1, logger: Logger]
    | [period: DurationInputArg1, logger: Logger, immediate: boolean]
    | [period: DurationInputArg1, unit: DurationInputArg2, logger: Logger]
    | [period: DurationInputArg1, unit: DurationInputArg2, logger: Logger, immediate: boolean]
): [duration: DurationInputArg1, unit: DurationInputArg2 | undefined, logger: Logger, immediate: boolean | undefined] {

    switch (args.length) {
        case 2:
            return [args[0], undefined, args[1], undefined];
        case 3:
            return check3Args(args)
                ? [args[0], undefined, args[1], args[2]]
                : [args[0], args[1], args[2], undefined];
        case 4:
            return args;
    }
}

function check3Args(args:
    | [period: DurationInputArg1, logger: Logger, immediate: boolean]
    | [period: DurationInputArg1, unit: DurationInputArg2, logger: Logger]
): args is [duration: DurationInputArg1, logger: Logger, immediate: boolean] {
    return typeof args[2] === 'boolean';
}
