import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class ArgsarraySubtag extends Subtag {
    public constructor() {
        super({
            name: 'argsarray',
            category: SubtagType.SIMPLE,
            definition: [
                {
                    parameters: [],
                    description: 'Gets user input as an array.',
                    exampleCode: 'Your input was {argsarray}',
                    exampleIn: 'Hello world!',
                    exampleOut: 'Your input was ["Hello","world!"]',
                    returns: 'string[]',
                    execute: (ctx) => ctx.input
                }
            ]
        });
    }
}
