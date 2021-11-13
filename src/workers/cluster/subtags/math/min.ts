import { Subtag } from '@cluster/bbtag';
import { bbtagUtil, parse, SubtagType } from '@cluster/utils';

export class MinSubtag extends Subtag {
    public constructor() {
        super({
            name: 'min',
            category: SubtagType.MATH,
            definition: [
                {
                    parameters: ['numbers+'],
                    description: 'Returns the smallest entry out of `numbers`. If an array is provided, it will be expanded to its individual values.',
                    exampleCode: '{min;50;2;65}',
                    exampleOut: '2',
                    returns: 'number',
                    execute: (_, args) => this.min(args.map(arg => arg.value))
                }
            ]
        });
    }

    public min(
        args: string[]
    ): number {
        const flattenedArgs = bbtagUtil.tagArray.flattenArray(args);
        const parsedArgs = flattenedArgs.map(arg => parse.float(arg?.toString() ?? ''));

        if (parsedArgs.filter(isNaN).length > 0)
            return NaN;

        return Math.min(...parsedArgs);
    }
}
