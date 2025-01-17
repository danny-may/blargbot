import { CommandContext, GlobalCommand } from '@blargbot/cluster/command';
import { avatarColours, CommandType, humanize, randChoose } from '@blargbot/cluster/utils';
import eris, { EmbedOptions } from 'eris';
import moment from 'moment-timezone';

export class StatsCommand extends GlobalCommand {
    public constructor() {
        super({
            name: 'stats',
            category: CommandType.GENERAL,
            definitions: [
                {
                    parameters: '',
                    description: 'Gives you some information about me',
                    execute: (ctx) => this.getStats(ctx)
                }
            ]
        });
    }

    public async getStats(context: CommandContext): Promise<EmbedOptions> {
        const clusterStats = Object.values(await context.cluster.worker.request('getClusterStats', undefined));
        const mappedStats = { guilds: 0, users: 0, channels: 0, rss: 0 };
        clusterStats.forEach(c => {
            mappedStats.guilds += c?.guilds ?? 0;
            mappedStats.users += c?.users ?? 0;
            mappedStats.channels += c?.channels ?? 0;
            mappedStats.rss += c?.rss ?? 0;
        });
        const version = await context.cluster.version.getVersion();
        return {
            color: randChoose(avatarColours),
            timestamp: moment().toDate(),
            title: 'Bot Statistics',
            footer: {
                text: 'blargbot',
                icon_url: context.discord.user.avatarURL
            },
            fields: [{
                name: 'Guilds',
                value: mappedStats.guilds.toString(),
                inline: true
            },
            {
                name: 'Users',
                value: mappedStats.users.toString(),
                inline: true
            },
            {
                name: 'Channels',
                value: mappedStats.channels.toString(),
                inline: true
            },
            {
                name: 'Shards',
                value: context.config.discord.shards.max.toString(),
                inline: true
            },
            {
                name: 'Clusters',
                value: Math.ceil(context.config.discord.shards.max / context.config.discord.shards.perCluster).toString(),
                inline: true
            },
            {
                name: 'RAM',
                value: humanize.ram(mappedStats.rss),
                inline: true
            },
            {
                name: 'Version',
                value: version,
                inline: true
            },
            {
                name: 'Uptime',
                value: `<t:${context.cluster.createdAt.unix()}:R>`,
                inline: true
            },
            {
                name: 'Eris',
                value: eris.VERSION,
                inline: true
            },
            {
                name: 'Node.js',
                value: process.version,
                inline: true
            }
            ]
        };
    }
}
