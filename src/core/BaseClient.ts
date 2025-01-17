import { Configuration } from '@blargbot/config';
import { BaseUtilities } from '@blargbot/core/BaseUtilities';
import { Database } from '@blargbot/database';
import { Logger } from '@blargbot/logger';
import { Client as Discord, ClientOptions as DiscordOptions, OAuthTeamMemberState } from 'eris';

import { getRange } from './utils';

export class BaseClient {
    #owners: readonly string[] = [];
    public readonly util: BaseUtilities;
    public readonly database: Database;
    public readonly discord: Discord;
    public get ownerIds(): readonly string[] { return this.#owners; }

    public constructor(
        public readonly logger: Logger,
        public readonly config: Configuration,
        discordConfig: DiscordOptions
    ) {
        this.util = new BaseUtilities(this);

        this.discord = new Discord(this.config.discord.token, discordConfig);

        this.database = new Database({
            logger: this.logger,
            rethink: this.config.rethink,
            cassandra: this.config.cassandra,
            postgres: this.config.postgres,
            airtable: this.config.airtable,
            shouldCacheGuild: id => this.discord.guilds.has(id),
            shouldCacheUser: id => this.discord.users.has(id)
        });
    }

    protected async connectDiscordGateway(): Promise<void> {
        const shards = getRange(this.discord.options.firstShardID ?? 0, this.discord.options.lastShardID ?? 0);
        const remainingShards = new Set(shards);
        await Promise.all([
            new Promise(resolve => this.discord.once('ready', resolve)).then(() => this.logger.init('discord connected')),
            createShardReadyWaiter(this.discord, remainingShards, this.logger),
            this.discord.connect()
        ]);
    }

    public async start(): Promise<void> {
        await this.database.connect().then(() => this.logger.init('database connected'));
        const application = await this.discord.getOAuthApplication();
        this.#owners = application.team?.members.filter(m => m.membership_state === OAuthTeamMemberState.ACCEPTED).map(m => m.user.id)
            ?? [application.owner.id];
        this.logger.init('Loaded', this.#owners, 'user(s) as owners');
    }
}

function createShardReadyWaiter(discord: Discord, shards: Set<number>, logger: Logger): Promise<void> {
    return new Promise(res => {
        function shardReady(shardId: number): void {
            if (!shards.delete(shardId))
                return;

            if (shards.size > 0)
                return logger.info('Shard', shardId, 'is ready. Remaining shards: [', ...[...shards].flatMap(s => [s, ',']).slice(0, -1), ']');

            discord.off('shardReady', shardReady);
            logger.info('Shard', shardId, 'is ready. All shards ready');
            res();
        }

        discord.on('shardReady', shardReady);
    });
}
