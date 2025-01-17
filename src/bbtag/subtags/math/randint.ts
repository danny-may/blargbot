import { Lazy } from '@blargbot/core/Lazy';
import { parse, randInt } from '@blargbot/core/utils';

import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { NotANumberError } from '../../errors';
import { SubtagType } from '../../utils';

export class RandIntSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'randint',
            category: SubtagType.MATH,
            definition: [
                {
                    parameters: ['min?:0', 'max'],
                    description: 'Chooses a random whole number between `min` and `max` (inclusive).',
                    exampleCode: 'You rolled a {randint;1;6}.',
                    exampleOut: 'You rolled a 5.',
                    returns: 'number',
                    execute: (ctx, [min, max]) => this.randInt(ctx, min.value, max.value)
                }
            ]
        });
    }

    public randInt(
        context: BBTagContext,
        minStr: string,
        maxStr: string
    ): number {
        const fallback = new Lazy(() => parse.int(context.scopes.local.fallback ?? ''));
        const min = parse.int(minStr) ?? fallback.value;
        if (min === undefined)
            throw new NotANumberError(minStr);

        const max = parse.int(maxStr) ?? fallback.value;
        if (max === undefined)
            throw new NotANumberError(maxStr);

        return randInt(min, max);
    }
}
