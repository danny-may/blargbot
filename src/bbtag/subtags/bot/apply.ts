import { parse } from '@blargbot/core/utils';

import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { BBTagRuntimeError, UnknownSubtagError } from '../../errors';
import { SubtagCall } from '../../language';
import { bbtag, SubtagType } from '../../utils';

export class ApplySubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'apply',
            category: SubtagType.ARRAY,
            definition: [
                {
                    parameters: ['subtag', 'args*'],
                    description:
                        'Executes `subtag`, using the `args` as parameters. ' +
                        'If `args` is an array, it will get deconstructed to it\'s individual elements.',
                    exampleCode: '{apply;randint;[1,4]}',
                    exampleOut: '3',
                    returns: 'string',
                    execute: (ctx, [subtagName, ...args], subtag) => this.defaultApply(ctx, subtagName.value, args.map(a => a.value), subtag)
                }
            ]
        });
    }

    public async defaultApply(
        context: BBTagContext,
        subtagName: string,
        args: string[],
        subtag: SubtagCall
    ): Promise<string> {
        try {
            context.getSubtag(subtagName.toLowerCase());
        } catch (error: unknown) {
            if (error instanceof UnknownSubtagError)
                throw new BBTagRuntimeError('No subtag found');
            throw error;
        }

        const flatArgs = args
            .flatMap(arg => bbtag.tagArray.deserialize(arg)?.v ?? [arg])
            .map(v => parse.string(v));

        const source = `{${[subtagName, ...flatArgs].join(';')}}`;

        return await context.eval({
            values: [{
                name: {
                    start: subtag.start,
                    end: subtag.start,
                    values: [subtagName],
                    source: subtagName
                },
                args: flatArgs.map(arg => ({
                    start: subtag.start,
                    end: subtag.start,
                    values: [arg],
                    source: arg
                })),
                start: subtag.start,
                end: subtag.end,
                source
            }],
            start: subtag.start,
            end: subtag.end,
            source
        });
    }
}
