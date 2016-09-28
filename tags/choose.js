var e = module.exports = {};
var bu;

var bot;
e.init = (Tbot, blargutil) => {
    bot = Tbot;
    bu = blargutil;

    e.category = bu.TagType.COMPLEX;
};

e.requireCtx = require;

e.isTag = true;
e.name = `choose`;
e.args = `&lt;choice&gt; &lt;choices...&gt;`;
e.usage = `{choose;choice;choices...}`;
e.desc = `Chooses from the given options, where <code>choice</code> is the index of the option
                                selected
                            `;
e.exampleIn = `I feel like eating {choose;1;cake;pie;pudding} today.`;
e.exampleOut = `I feel like eating pie today.`;


e.execute = (msg, args, fallback) => {
    var replaceString = '';
    var replaceContent = false;

    if (args.length > 2) {
        replaceString = args[parseInt(bu.processSpecial(args[1])) + 2];
        if (!replaceString) {
            replaceString = args[2];
        }
    } else
        replaceString = bu.tagProcessError(fallback, '`Not enough arguments`');

    return {
        replaceString: replaceString,
        replaceContent: replaceContent
    };
};