import { BaseSubtag, BBTagContext, tagVariableScopes } from '@cluster/bbtag';
import { SubtagCall } from '@cluster/types';
import { bbtagUtil, parse, SubtagType } from '@cluster/utils';

export class GetSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'get',
            category: SubtagType.COMPLEX,
            definition: [
                {
                    parameters: ['name'],
                    description: 'Returns the stored variable `varName`.\n' +
                        'You can use a character prefix to determine the scope of your variable.\n' +
                        'Valid scopes are: ' + tagVariableScopes.map((s) => `${s.prefix.length === 0 ? 'no prefix' : `\`${s.prefix}\``} (${s.name})`).join(', ') +
                        '. For more information, use `b!t docs variable` or `b!cc docs variable`',
                    exampleCode: '{set;var1;This is local var1}\n{set;~var2;This is temporary var2}\n{get;var1}\n{get;~var2}',
                    exampleOut: 'This is local var1\nThis is temporary var2',
                    execute: async (ctx, [{ value: variableName }]) => await this.get(ctx, variableName)
                },
                {
                    parameters: ['name', 'index'],
                    description: 'When variable `name` is an array this will return the element at index `index`.' +
                        ' If `index` is empty the entire array will be returned. If variable is not an array it will return the whole variable.',
                    execute: async (ctx, [{ value: variableName }, { value: index }], subtag) => await this.getArray(ctx, variableName, index, subtag)
                }
            ]
        });
    }

    public async get(context: BBTagContext, variableName: string): Promise<string> {
        const arr = await bbtagUtil.tagArray.getArray(context, variableName);
        if (arr !== undefined && Array.isArray(arr.v))
            return JSON.stringify(arr);
        const result = await context.variables.get(variableName);
        switch (typeof result) {
            case 'object':
                return JSON.stringify(result);
            case 'number':
            case 'string':
            case 'boolean':
                return result.toString();
            case 'undefined':
                return '';
        }
    }

    public async getArray(context: BBTagContext, variableName: string, index: string | number, subtag: SubtagCall): Promise<string> {
        const result = await context.variables.get(variableName);
        if (!Array.isArray(result)) {
            switch (typeof result) {
                case 'object':
                    return JSON.stringify(result);
                case 'number':
                case 'string':
                case 'boolean':
                    return result.toString();
                case 'undefined':
                    return '';
            }
        }

        if (index === '')
            return bbtagUtil.tagArray.serialize(result);

        index = parse.int(index);
        if (isNaN(index))
            return this.notANumber(context, subtag);

        if (result[index] === undefined)
            return this.customError('Index out of range', context, subtag);

        const itemAtIndex = result[index];
        switch (typeof itemAtIndex) {
            case 'object':
                return JSON.stringify(itemAtIndex);
            case 'number':
            case 'string':
            case 'boolean':
                return itemAtIndex.toString();
            case 'undefined':
                return '';
        }
    }
}
