import { Subtag } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class SplitSubtag extends Subtag {
    public constructor() {
        super({
            name: 'split',
            category: SubtagType.ARRAY,
            definition: [
                {
                    parameters: ['text', 'splitter?'],
                    description: 'Splits `text` using `splitter`, and the returns an array.',
                    exampleCode: '{split;Hello! This is a sentence.;{space}}',
                    exampleOut: '["Hello!","This","is","a","sentence."]',
                    returns: 'string[]',
                    execute: (_, [text, splitter]) => text.value.split(splitter.value)
                }
            ]
        });
    }
}
