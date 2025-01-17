import { Cluster } from '@blargbot/cluster';
import { WolkenCommand } from '@blargbot/cluster/command';

export class KissCommand extends WolkenCommand {
    public constructor(cluster: Cluster) {
        super('kiss', {
            search: 'kiss',
            action: 'kisses',
            user: true,
            description: 'Give someone a kiss!',
            wolkeKey: cluster.config.general.wolke
        });
    }
}
