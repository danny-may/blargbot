import { createHash } from 'crypto';

import { CompiledSubtag } from '../../compilation';
import { SubtagType } from '../../utils';

export class Md5Subtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'md5',
            aliases: ['md5encode'],
            category: SubtagType.MISC,
            deprecated: 'hash',
            definition: [
                {
                    parameters: ['text'],
                    description: 'Converts the provided text to md5.',
                    exampleCode: '{md5;Woosh whap phew!}',
                    exampleOut: '71d97a11f770a34d7f8cf1f1d8749d85',
                    returns: 'string',
                    execute: (_, [text]) => this.md5Hash(text.value)
                }
            ]
        });
    }

    public md5Hash(value: string): string {
        const hash = createHash('md5');
        return hash.update(value).digest('hex');
    }
}
