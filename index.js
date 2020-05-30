let TelegramBot = require('node-telegram-bot-api');

let token = "1122460821:AAEvt2V7-zz6dKuSScXAKCeKJP6Wk2m54_c";
let bot = new TelegramBot(token, {polling: true});
let games =[];

class Game{
    construsctor(status, player1_id,player2_id,player1_name,player2_name,word=' ',guess=[]){
        this.status = status;
        this.player1_id = player1_id;
        this.player2_id = player2_id;
        this.player1_name=player1_name;
        this.player2_name=player2_name;
        this.word=word;
        this.guess=guess;
    }
};

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

bot.onText(/join [0-9]+/,function(msg){
    let chat=msg.chat.id;
    if(game_id(chat)==-1){
    let input_id = msg.text.slice(6);
    let yes=0;
     while(yes==0){
            if(games.length>input_id&&games[input_id].status==1){
                games[input_id].status=2;
                games[input_id].player2_id=chat;
                games[input_id].player2_name=msg.chat.username;
                yes=1;
                bot.sendMessage(chat,"Okay, you are playing with @"+games[game_id(chat)].player1_name);
                bot.sendMessage(games[game_id(chat)].player1_id,"User @"+games[game_id(chat)].player2_name+" joined the game.\n To begin the game, use command /begin");
            }
            else bot.sendMessage(chat, "Sorry, wrong ID");
        }
    }
    else bot.sendMessage(chat, "Sorry, you are already playing");
});
