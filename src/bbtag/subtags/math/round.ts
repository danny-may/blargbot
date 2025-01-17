import { parse } from '@blargbot/core/utils';

import { CompiledSubtag } from '../../compilation';
import { NotANumberError } from '../../errors';
import { SubtagType } from '../../utils';

export class RoundSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'round',
            category: SubtagType.MATH,
            definition: [
                {
                    parameters: ['number'],
                    description: 'Rounds `number` to the nearest whole number.',
                    exampleCode: '{round;1.23}',
                    exampleOut: '1',
                    returns: 'number',
                    execute: (_, [number]) => this.round(number.value)
                }
            ]
        });
    }

    public round(value: string): number {
        const number = parse.float(value);
        if (number === undefined)
            throw new NotANumberError(value);
        return Math.round(number);
    }
}
