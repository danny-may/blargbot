import { BBTagContext, Subtag } from '@cluster/bbtag';
import { parse, SubtagType } from '@cluster/utils';

export class HereMentionSubtag extends Subtag {
    public constructor() {
        super({
            name: 'heremention',
            aliases: ['here'],
            category: SubtagType.MESSAGE,
            definition: [
                {
                    parameters: ['mention?'],
                    description: 'Returns the mention of `@here`.\nThis requires the `disableeveryone` setting to be false. If `mention` is set to `true`, `@here` will ping, else it will be silent.',
                    exampleCode: '{heremention}',
                    exampleOut: '@here',
                    execute: (ctx, args) => this.hereMention(ctx, args[0].value)
                }
            ]
        });
    }

    public hereMention(
        context: BBTagContext,
        mention: string
    ): string {
        const enabled = parse.boolean(mention, true);
        context.state.allowedMentions.everybody = enabled;

        return '@here';
    }
}
