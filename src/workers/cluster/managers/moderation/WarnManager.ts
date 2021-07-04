import { Member, User } from 'eris';
import { Cluster } from '../../Cluster';
import { ModerationType, Modlog, WarnResult } from '../../core';
import { ModerationManager } from '../ModerationManager';

export class WarnManager {
    private get cluster(): Cluster { return this.manager.cluster; }
    private get modlog(): Modlog { return this.manager.modlog; }

    public constructor(public readonly manager: ModerationManager) {
    }

    public async warn(member: Member, moderator: User, count: number, reason?: string): Promise<WarnResult> {
        const warnings = await this.cluster.database.guilds.getWarnings(member.guild.id, member.id) ?? 0;
        const banAt = await this.cluster.database.guilds.getSetting(member.guild.id, 'banat') ?? Infinity;
        const kickAt = await this.cluster.database.guilds.getSetting(member.guild.id, 'kickat') ?? Infinity;
        let newCount = Math.max(0, warnings + count);
        let result: WarnResult = {
            type: ModerationType.WARN,
            count: newCount,
            result: 'success'
        };

        await this.modlog.logWarn(member.guild, member.user, count, newCount, moderator, reason);

        if (this.cluster.util.isBotHigher(member)) {
            if (banAt > 0 && count >= banAt) {
                result = {
                    type: ModerationType.BAN,
                    result: await this.manager.bans.ban(member, this.cluster.discord.user, undefined, `[ Auto-Ban ] Exceeded Warning Limit (${count}/${banAt})`),
                    count: newCount = 0
                };
            } else if (kickAt > 0 && count >= kickAt) {
                result = {
                    type: ModerationType.KICK,
                    result: await this.manager.bans.kick(member, this.cluster.discord.user, `[ Auto-Kick ] Exceeded warning limit (${count}/${kickAt})`),
                    count: newCount
                };
            }
        }

        await this.cluster.database.guilds.setWarnings(member.guild.id, member.id, count <= 0 ? undefined : count);
        return result;
    }

    public async pardon(member: Member, moderator: User, count: number, reason?: string): Promise<number> {
        const oldWarnings = await this.cluster.database.guilds.getWarnings(member.guild.id, member.id) ?? 0;
        const newCount = Math.max(0, oldWarnings - count);

        await this.modlog.logPardon(member.guild, member.user, count, newCount, moderator, reason);
        await this.cluster.database.guilds.setWarnings(member.guild.id, member.id, newCount <= 0 ? undefined : newCount);

        return count;
    }

}
