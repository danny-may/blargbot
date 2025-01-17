import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { ChannelNotFoundError, MessageNotFoundError } from '../../errors';
import { SubtagType } from '../../utils';

export class MessageSenderSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'messagesender',
            category: SubtagType.MESSAGE,
            aliases: ['sender'],
            definition: [
                {
                    parameters: [],
                    description: 'Returns the id of the author of the executing message.',
                    exampleCode: 'That was sent by "{sender}"',
                    exampleOut: 'That was sent by "1111111111111"',
                    returns: 'id',
                    execute: (ctx) => this.getMessageSender(ctx, ctx.channel.id, ctx.message.id, false)
                },
                {
                    parameters: ['messageid'],
                    description: 'Returns the id of the author of `messageid` in the current channel.',
                    exampleCode: 'Message 1111111111111 was sent by {sender;1111111111111}',
                    exampleOut: 'Message 1111111111111 was sent by 2222222222222',
                    returns: 'id',
                    execute: (ctx, [messageId]) => this.getMessageSender(ctx, ctx.channel.id, messageId.value, false)
                },
                {
                    parameters: ['channel', 'messageid', 'quiet?'],
                    description: 'Returns the id of the author of `messageid` in `channel`. If `quiet` is provided and `channel` cannot be found, this will return nothing.',
                    exampleCode: 'Message 1111111111111 in #support was sent by {sender;support;1111111111111}',
                    exampleOut: 'Message 1111111111111 in #support was sent by 2222222222222',
                    returns: 'id',
                    execute: (ctx, [channel, message, quiet]) => this.getMessageSender(ctx, channel.value, message.value, quiet.value !== '')
                }
            ]
        });
    }

    public async getMessageSender(
        context: BBTagContext,
        channelStr: string,
        messageStr: string,
        quiet: boolean
    ): Promise<string> {
        quiet ||= context.scopes.local.quiet ?? false;
        const channel = await context.queryChannel(channelStr, { noLookup: quiet });
        if (channel === undefined) {
            throw new ChannelNotFoundError(channelStr)
                .withDisplay(quiet ? '' : undefined);
        }

        const message = await context.getMessage(channel, messageStr);
        if (message === undefined) {
            throw new MessageNotFoundError(channel.id, messageStr)
                .withDisplay(quiet ? '' : undefined);
        }
        return message.author.id;

    }
}
