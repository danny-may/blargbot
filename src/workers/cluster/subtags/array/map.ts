import { BBTagContext, Subtag } from '@cluster/bbtag';
import { SubtagArgument } from '@cluster/types';
import { bbtagUtil, SubtagType } from '@cluster/utils';

export class MapSubtag extends Subtag {
    public constructor() {
        super({
            name: 'map',
            category: SubtagType.ARRAY,
            definition: [
                {
                    parameters: ['variable', 'array', '~code'],
                    description: 'Provides a way to populate an array by executing a function on each of its elements,' +
                        ' more info [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)\n' +
                        'For every element in `array`, a variable called `variable` will be set to the current element. The output of `function`' +
                        ' will be the new value of the element. This will return the new array, and will not modify the original.',
                    exampleCode: '{map;~item;["apples","oranges","pears"];{upper;{get;~item}}}',
                    exampleOut: '["APPLES","ORANGES","PEARS"]',
                    returns: '(string|error)[]',
                    execute: (context, [varName, array, code]) => this.map(context, varName.value, array.value, code)
                }
            ]
        });
    }

    public async * map(context: BBTagContext, varName: string, arrayStr: string, code: SubtagArgument): AsyncIterable<string> {
        const { v: array } = await bbtagUtil.tagArray.getArray(context, arrayStr) ?? { v: [] };
        try {
            for (const item of array) {
                await context.limit.check(context, 'map:loops');
                await context.variables.set(varName, item);
                yield await code.execute();

                if (context.state.return !== 0)
                    break;
            }
        } finally {
            await context.variables.reset(varName);
        }
    }
}
