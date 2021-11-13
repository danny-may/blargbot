import { BBTagContext } from '@cluster/bbtag';
import { BBTagRuntimeError } from '@cluster/bbtag/errors';
import { RuntimeLimitRule, SubtagCall } from '@cluster/types';
import { humanize } from '@cluster/utils';

export class DisabledInRule implements RuntimeLimitRule {
    private readonly subtags: readonly string[];
    public constructor(...subtagNames: readonly string[]) {
        this.subtags = subtagNames;
    }

    public check(context: BBTagContext, subtagName: string): void {
        const problem = this.subtags.map(s => ({ s, i: context.callStack.lastIndexOf(s) }))
            .reduce((p, c) => p.i < c.i ? c : p, { s: '', i: -1 });
        if (problem.s.length > 0) {
            const { subtag } = context.callStack.get(problem.i) ?? { subtag: unknownSubtag };
            throw new BBTagRuntimeError(`{${subtagName}} is disabled inside {${problem.s}}`, `${problem.s} located at:\n` +
                `Index ${subtag.start.index}: Line ${subtag.start.line}, column ${subtag.start.column}\n` +
                `Index ${subtag.end.index}: Line ${subtag.end.line}, column ${subtag.end.column}`);
        }
    }

    public displayText(): string {
        return `Cannot be used in the arguments to ${humanize.smartJoin(this.subtags.map(s => `{${s}}`), ', ', ' or ')}`;
    }

    public state(): JToken {
        return null;
    }

    public load(): void {
        // no-op
    }
}

const unknownSubtag: Pick<SubtagCall, 'start' | 'end'> = {
    start: {
        column: -1,
        index: -1,
        line: -1
    },
    get end() { return this.start; }
};
