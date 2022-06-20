const { Telegraf, Scenes, session, Context } = require("telegraf");
require("dotenv").config();
const { SET_REMINDER, UPDATE_REMINDER, DELETE_REMINDER } = require("./Scenes");
const {
	readReminders,
	getDateFromTimeStamp,
} = require("./util/helperFunctions");
console.log(process.env.TOKEN);
const bot = new Telegraf(process.env.TOKEN);
const stage = new Scenes.Stage([
	SET_REMINDER,
	UPDATE_REMINDER,
	DELETE_REMINDER,
]);
bot.use(session());
bot.use(stage.middleware());

bot.command("setreminder", (ctx) => {
	ctx.scene.enter("SET_REMINDER");
});
bot.command("listReminder", async (ctx) => {
	console.log("Hello from List Reminder command");
	const reminders = await readReminders();
	console.log("reminders in listReminder", reminders);
	if (reminders.length > 0) {
		ctx.reply("Here is a list of Reminders");
		for (let i = 0; i < reminders.length; i++) {
			ctx.reply(
				`NAME:- ${reminders[i].name}, \n Date:- ${getDateFromTimeStamp(
					reminders[i].dateTime
				)}`
			);
		}
	} else {
		ctx.reply("No reminder has been set");
		ctx.reply("click on /setreminder to set a reminder");
	}
});
bot.command("updateReminder", async (ctx) => {
	ctx.scene.enter("UPDATE_REMINDER");
});
bot.command("deleteReminder", async (ctx) => {
	ctx.scene.enter("DELETE_REMINDER");
});
bot.hears("hi", (ctx) => {
	ctx.reply(`please click on /setreminder`);
	ctx.reply(ctx.chat.id);
});
bot.launch();
