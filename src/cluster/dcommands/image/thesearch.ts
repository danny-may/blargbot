import { CommandContext, GlobalImageCommand } from '@blargbot/cluster/command';
import { ImageResult } from '@blargbot/image/types';

export class TheSearchCommand extends GlobalImageCommand {
    public constructor() {
        super({
            name: 'thesearch',
            definitions: [
                {
                    parameters: '{text+}',
                    description: 'Tells everyone about the progress of the search for intelligent life.',
                    execute: (ctx, [text]) => this.render(ctx, text.asString)
                }
            ]
        });
    }

    public async render(context: CommandContext, text: string): Promise<ImageResult | string> {
        text = await context.util.resolveTags(context, text);
        return await this.renderImage(context, 'thesearch', { text });
    }
}
