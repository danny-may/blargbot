import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { bbtag, SubtagType } from '../../utils';

export class JsonGetSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'jsonget',
            category: SubtagType.JSON,
            aliases: ['jget'],
            definition: [
                {
                    parameters: ['input:{}#10000000'],
                    description: 'Gets a json value. Works with arrays too!\n' +
                        '`input` can be a JSON object, array, or string. If a string is provided, a variable with the same name will be used.',
                    exampleCode: '{jsonget;{j;{\n  "array": [\n    "zero",\n    { "value": "one" },\n    "two"\n  ]\n}};array.1.value}',
                    exampleOut: 'one',
                    returns: 'json|nothing',
                    execute: (ctx, [input]) => this.jsonGet(ctx, input.value, undefined)
                },
                {
                    parameters: ['input:{}#10000000', 'path'],
                    description: 'Navigates the path of a JSON object. Works with arrays too!\n' +
                        '`input` can be a JSON object, array, or string. If a string is provided, a variable with the same name will be used.\n' +
                        '`path` is a dot-noted series of properties.',
                    exampleCode: '{jsonget;{j;{\n  "array": [\n    "zero",\n    { "value": "one" },\n    "two"\n  ]\n}};array.1.value}',
                    exampleOut: 'one',
                    returns: 'json|nothing',
                    execute: (ctx, [input, path]) => this.jsonGet(ctx, input.value, path.value)
                }
            ]
        });
    }

    public async jsonGet(context: BBTagContext, input: string, path?: string): Promise<JToken | undefined> {
        const obj = (await bbtag.json.resolveObj(context, input)).object;
        if (path === undefined)
            return obj;
        return bbtag.json.get(obj, path);
    }
}
