import { guard } from '@blargbot/core/utils';
import { parse } from '@blargbot/core/utils/parse';
import { DiscordRESTError } from 'eris';
import fetch from 'node-fetch';

import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { BBTagRuntimeError } from '../../errors';
import { bbtag, SubtagType } from '../../utils';

interface EmojiCreateOptions {
    name: string;
    image: string;
    roles: string[];
}

export class EmojiCreateSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'emojicreate',
            category: SubtagType.GUILD,
            definition: [
                {
                    parameters: ['name', 'image'],
                    description: 'Creates a emoji with the given name and image. ' +
                        '`image` is either a link to an image, or a base64 encoded data url (`data:<content-type>;base64,<base64-data>`). You may need to use {semi} for the latter.' + 'Returns the new emojis\'s ID.',
                    exampleCode: '{emojicreate;fancy_emote;https://some.cool/image.png}',
                    exampleOut: '11111111111111111',
                    returns: 'id',
                    execute: (ctx, [name, image]) => this.createEmoji(ctx, name.value, image.value, '')
                },
                {
                    parameters: ['name', 'image', 'roles'],
                    description: 'Creates a emoji with the given name and image. ' +
                        '`image` is either a link to an image, or a base64 encoded data url (`data:<content-type>;base64,<base64-data>`). You may need to use {semi} for the latter.' +
                        '`roles`, if provided, will restrict the emoji\'s usage to the specified roles. Must be an array of roles.' +
                        'Returns the new emojis\'s ID.',
                    exampleCode: '{emojicreate;fancy_emote;https://some.cool/image.png;["Cool gang"]}',
                    exampleOut: '11111111111111111',
                    returns: 'id',
                    execute: (ctx, [name, image, roles]) => this.createEmoji(ctx, name.value, image.value, roles.value)
                }
            ]
        });
    }

    public async createEmoji(
        context: BBTagContext,
        name: string,
        imageStr: string,
        rolesStr: string
    ): Promise<string> {
        if (!context.hasPermission('manageEmojisAndStickers'))
            throw new BBTagRuntimeError('Author cannot create emojis');

        const options: EmojiCreateOptions = {
            name,
            image: imageStr,
            roles: []
        };

        if (options.name === '')
            throw new BBTagRuntimeError('Name was not provided');

        const image: string = parse.url(options.image);
        if (guard.isUrl(image)) {
            const res = await fetch(image);
            const contentType = res.headers.get('content-type');
            options.image = `data:${contentType ?? ''};base64,${(await res.buffer()).toString('base64')}`;
        } else if (!image.startsWith('data:')) {
            throw new BBTagRuntimeError('Image was not a buffer or a URL');
        }

        //TODO would be nice to be able to provide one role without using an array like {emojicreate;name;image;role} and not {emojicreate;name;image;["role"]}
        const roleArray = await bbtag.tagArray.deserializeOrGetArray(context, rolesStr);
        if (roleArray !== undefined) {
            for (const roleQuery of roleArray.v) {
                const role = await context.queryRole(roleQuery?.toString() ?? '', { noLookup: true });
                if (role !== undefined) {
                    options.roles.push(role.id);
                }
            }
        }

        try {
            const emoji = await context.guild.createEmoji({ image: options.image, name: options.name, roles: options.roles }, context.auditReason());
            return emoji.id;
        } catch (err: unknown) {
            if (!(err instanceof DiscordRESTError))
                throw err;

            const parts = err.message.split('\n').map(m => m.trim());
            throw new BBTagRuntimeError(`Failed to create emoji: ${parts[1] ?? parts[0]}`);
        }
    }
}
