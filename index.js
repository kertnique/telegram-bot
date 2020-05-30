let TelegramBot = require('node-telegram-bot-api');

let token = "1122460821:AAEvt2V7-zz6dKuSScXAKCeKJP6Wk2m54_c";
let bot = new TelegramBot(token, {polling: true});

bot.onText(/start|help/,function (msg){
    let chat = msg.chat.id;
    bot.sendMessage(chat,"To create new game, use command /create\n To join existing game, use command /join and your game ID");
});
