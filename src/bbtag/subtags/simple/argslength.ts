import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { SubtagType } from '../../utils';

export class ArgsLengthSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'argslength',
            category: SubtagType.SIMPLE,
            definition: [
                {
                    parameters: [],
                    description: 'Return the number of arguments the user provided.',
                    exampleCode: 'You said {argslength} words.',
                    exampleIn: 'I am saying things.',
                    exampleOut: 'You said 4 words.',
                    returns: 'number',
                    execute: (ctx) => this.getArgsLength(ctx)
                }
            ]
        });
    }

    public getArgsLength(context: BBTagContext): number {
        return context.input.length;
    }
}
