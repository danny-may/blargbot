import { BBTagContext, Subtag } from '@cluster/bbtag';
import { ChannelNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class ChannelCategorySubtag extends Subtag {
    public constructor() {
        super({
            name: 'channelcategory',
            aliases: ['category'],
            category: SubtagType.CHANNEL,
            definition: [
                {
                    parameters: [],
                    description: 'Returns the category ID of the current channel.',
                    exampleCode: '{channelcategory}',
                    exampleOut: '111111111111111',
                    execute: (ctx) => ctx.channel.id
                },
                {
                    parameters: ['channel', 'quiet?'],
                    description: 'Returns the category ID of the provided `channel`. If the provided `channel` is a category this returns nothing. If it cannot be found returns `No channel found`, or nothing if `quiet` is `true`.',
                    exampleCode: '{channelcategory;cool channel}\n{channelcategory;cool category}',
                    exampleOut: '111111111111111\n(nothing is returned here)',
                    execute: (ctx, [channel, quiet]) => this.getCategory(ctx, channel.value, quiet.value !== '')
                }
            ]
        });
    }

    public async getCategory(
        context: BBTagContext,
        channelStr: string,
        quiet: boolean
    ): Promise<string> {
        quiet ||= context.scopes.local.quiet ?? false;
        const channel = await context.queryChannel(channelStr, { noLookup: quiet });
        if (channel !== undefined)
            return channel.parent?.id ?? '';
        if (quiet)
            return '';
        throw new ChannelNotFoundError(channelStr);
    }
}
