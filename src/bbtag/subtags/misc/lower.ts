import { CompiledSubtag } from '../../compilation';
import { SubtagType } from '../../utils';

export class LowerSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'lower',
            category: SubtagType.MISC,
            definition: [
                {
                    parameters: ['text'],
                    description: 'Returns `text` as lowercase.',
                    exampleCode: '{lower;THIS WILL BECOME LOWERCASE}',
                    exampleOut: 'this will become lowercase',
                    returns: 'string',
                    execute: (_, [text]) => this.lowercase(text.value)
                }
            ]
        });
    }

    public lowercase(value: string): string {
        return value.toLowerCase();
    }
}
