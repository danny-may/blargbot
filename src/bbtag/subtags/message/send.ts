import { MalformedEmbed } from '@blargbot/core/types';
import { guard, parse } from '@blargbot/core/utils';
import { DiscordRESTError, EmbedOptions, FileContent } from 'eris';

import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { BBTagRuntimeError, ChannelNotFoundError } from '../../errors';
import { SubtagType } from '../../utils';

export class SendSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'send',
            category: SubtagType.MESSAGE,
            description: 'If `embed` is an array, multiple embeds will be added to the message payload.',
            definition: [
                {
                    parameters: ['channel', 'message', 'embed', 'fileContent', 'fileName?:file.txt'],
                    description: 'Sends `message` and `embed` to `channel` with an attachment, and returns the message id. `channel` is either an id or channel mention. '
                        + 'If `fileContent` starts with `buffer:` then the following text will be parsed as base64 to a raw buffer.\n'
                        + '**Note:** `embed` is the JSON for an embed, don\'t put the `{embed}` subtag there, as nothing will show',
                    exampleCode: '{send;{channelid};Hello there!;{embedbuild;title:This is a cool embed};Wow, look at this text file!;test.txt}',
                    exampleOut: '23946728937462847243',
                    returns: 'id',
                    execute: (ctx, [channel, message, embed, fileContent, fileName]) => this.send(ctx, channel.value, message.value, parse.embed(embed.value), { file: fileContent.value, name: fileName.value })
                },
                {
                    parameters: ['channel', 'message', 'embed'],
                    description: 'Sends `message` and `embed` to `channel`, and returns the message id. `channel` is either an id or channel mention.\n'
                        + '**Note:** `embed` is the JSON for an embed, don\'t put the `{embed}` subtag there, as nothing will show',
                    exampleCode: '{send;{channelid};Hello there!;{embedbuild;title:This is a cool embed}}',
                    exampleOut: '349587638464585678545',
                    returns: 'id',
                    execute: (ctx, [channel, message, embed]) => this.send(ctx, channel.value, message.value, parse.embed(embed.value))
                },
                {
                    parameters: ['channel', 'content'],
                    description: 'Sends `content` to `channel`, and returns the message id. `channel` is either an id or channel mention.\n'
                        + '**Note:** `content` is the text to send or the JSON for an embed, don\'t put the `{embed}` subtag there, as nothing will show',
                    exampleCode: '{send;{channelid};{embedbuild;title:This is a cool embed}',
                    exampleOut: '9458678957457694324',
                    returns: 'id',
                    execute: (ctx, [channel, content]) => this.send(ctx, channel.value, ...resolveContent(content.value))
                }
            ]
        });
    }

    public async send(context: BBTagContext, channelId: string, message?: string, embed?: EmbedOptions[] | MalformedEmbed[], file?: FileContent): Promise<string> {
        const channel = await context.queryChannel(channelId, { noLookup: true });
        if (channel === undefined || !guard.isTextableChannel(channel))
            throw new ChannelNotFoundError(channelId);

        if (typeof file?.file === 'string' && file.file.startsWith('buffer:'))
            file.file = Buffer.from(file.file.slice(7), 'base64');

        const disableEveryone = !context.isCC
            || (await context.database.guilds.getSetting(channel.guild.id, 'disableeveryone')
                ?? !context.data.allowedMentions.everybody);

        try {
            const sent = await context.util.send(channel, {
                content: message,
                embeds: embed !== undefined ? embed : undefined,
                nsfw: context.data.nsfw,
                allowedMentions: {
                    everyone: !disableEveryone,
                    roles: context.isCC ? context.data.allowedMentions.roles : undefined,
                    users: context.isCC ? context.data.allowedMentions.users : undefined
                },
                files: file !== undefined ? [file] : undefined
            });

            if (sent === undefined)
                throw new BBTagRuntimeError('Send unsuccessful');

            context.data.ownedMsgs.push(sent.id);
            return sent.id;
        } catch (err: unknown) {
            if (err instanceof BBTagRuntimeError)
                throw err;
            if (err instanceof DiscordRESTError)
                throw new BBTagRuntimeError(`Failed to send: ${err.message}`);
            if (!(err instanceof Error && err.message === 'No content'))
                context.logger.error('Failed to send!', err);
            throw new BBTagRuntimeError('Failed to send: UNKNOWN');
        }

    }
}

function resolveContent(content: string): [string | undefined, EmbedOptions[] | undefined] {
    const embeds = parse.embed(content);
    if (embeds === undefined || 'malformed' in embeds[0])
        return [content, undefined];
    return [undefined, embeds];
}
