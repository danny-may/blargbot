import { mapping } from '@blargbot/mapping';

import { BBTagContext } from '../../BBTagContext';
import { BBTagRuntimeError } from '../../errors';
import { RuntimeLimitRule } from '../RuntimeLimitRule';

export class UseCountRule implements RuntimeLimitRule {
    readonly #type: string;
    readonly #makeError: (subtagName: string) => BBTagRuntimeError;
    #initial: number;
    #remaining: number;

    public constructor(count: number, type = 'uses', error: string | ((subtagName: string) => BBTagRuntimeError) = 'Usage') {
        this.#initial = count;
        this.#remaining = count;
        this.#type = type;
        this.#makeError = typeof error === 'string'
            ? (subtagName) => new BBTagRuntimeError(`${error} limit reached for ${subtagName}`)
            : error;
    }

    public check(_context: BBTagContext, subtagName: string): void {
        if (this.#remaining-- <= 0)
            throw this.#makeError(subtagName);
    }

    public displayText(): string {
        return `Maximum ${this.#initial} ${this.#type}`;
    }

    public state(): [number, number] {
        return [this.#remaining, this.#initial];
    }

    public load(state: JToken): void {
        const mapped = mapState(state);
        if (!mapped.valid)
            throw new Error(`Invalid state ${JSON.stringify(state)}`);

        this.#remaining = mapped.value[0];
        this.#initial = mapped.value[1];
    }
}

const mapState = mapping.tuple<[number, number]>([
    mapping.number,
    mapping.number
]);
