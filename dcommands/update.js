var e = module.exports = {};
var bu = require('./../util.js');
var exec = require('child_process').exec;

var bot;
e.init = (Tbot) => {
    bot = Tbot;
};

e.requireCtx = require;

e.isCommand = true;
e.hidden = false;
e.usage = 'Yo shit waddup we\'re updating';
e.info = 'Does a git pull';
e.category = bu.CommandType.CAT;

e.execute = (msg, words, text) => {
    if (msg.author.id === bu.CAT_ID) {
        if (!bu.config.general.isbeta) {
            exec('cd /home/cat/blargjs\ngit pull origin master', (err, stdout, stderr) => {
                var message = '```xl\n';
                if (err) {
                    message += err + '\n';
                }
                if (stderr) {
                    message += stderr + '\n';
                }
                if (stdout) {
                    message += stdout + '\n';
                }
                
                message += '```';
                bu.sendMessageToDiscord(msg.channel.id, message);
            });
        } else {
            bu.sendMessageToDiscord(msg.channel.id, `Whoa, you can't do that! This is the beta build!`);
        }
    }
};