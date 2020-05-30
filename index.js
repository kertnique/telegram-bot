let TelegramBot = require('node-telegram-bot-api');

let token = "1122460821:AAEvt2V7-zz6dKuSScXAKCeKJP6Wk2m54_c";
let bot = new TelegramBot(token, {polling: true});

let  game_id =(id) =>{
    for(let i=games.length-1;i>=0;i--){
        if(games[i].status!=0){
            if(games[i].player1_id==id||games[i].player2_id==id) return i;
        }
    }
    return -1;
}

bot.onText(/start|help/,function (msg){
    let chat = msg.chat.id;
    bot.sendMessage(chat,"To create new game, use command /create\n To join existing game, use command /join and your game ID");
});

bot.onText(/create/,function (msg){
    let chat = msg.chat.id;
    if(game_id(chat)==-1){
        let i=games.length;
        games.push(new Game());
        games[i].status=1;
        games[i].player1_id=chat;
        games[i].player1_name=msg.chat.username;
        bot.sendMessage(chat,"This is your game ID: "+ i +"\n Please share this number with person, you want to play with.");
    }
    else bot.sendMessage(chat, "Sorry, you are already playing");
});
