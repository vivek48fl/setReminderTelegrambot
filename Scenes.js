const { Telegraf, Scenes, session, Context } = require("telegraf");
const { clientPromise } = require("./util/mongodbConnector");
const {
	saveToDb,
	createDate,
	readReminders,
	updateReminder,
	getDateFromTimeStamp,
	readReminderById,
	deleteReminderById,
} = require("./util/helperFunctions");
require("dotenv").config();
const { enter, leave } = Scenes.Stage;
const bot = new Telegraf(process.env.TOKEN);
const users = [
	{
		id: 01,
		name: "Vivek ",
	},
	{ id: 02, name: "Ravi" },
];
const SET_REMINDER = new Scenes.WizardScene(
	"SET_REMINDER",
	async (ctx) => {
		//1 Ask user to select name
		await ctx.reply(
			"please select a user to schedule to sending a message"
		);
		const userList = users.map((user) => {
			return { text: user.name, callback_data: user.id };
		});
		await ctx.reply("Choose user", {
			reply_markup: {
				inline_keyboard: [userList],
			},
		});
		ctx.wizard.next();
	},
	async (ctx) => {
		let userId = ctx.callbackQuery.data;
		ctx.session.userId = userId;
		ctx.session.name = users[userId - 1].name;
		await ctx.reply(`You have selected ${users[userId - 1].name}`);
		// 2 Ask user to enter date in dd/mm/yy format
		await ctx.reply("please enter Date in dd/mm/yyyy format");

		ctx.wizard.next();
	},
	async (ctx) => {
		// store previous data in session
		let date = ctx.message.text;
		ctx.session.date = date;
		await ctx.reply(`You have entered date: ${ctx.session.date}`);
		await ctx.reply("Please enter time in hh:mm format");

		ctx.wizard.next();
	},
	async (ctx) => {
		// store previous data in session
		const time = ctx.message.text;
		ctx.session.time = time;
		console.log(ctx.session.date, "date in session");

		const miliSeconds = createDate(ctx.session.date, ctx.session.time);
		console.log(`Date & time in miliseconds ${miliSeconds}`);
		await ctx.reply(
			`You have entered date & time: ${ctx.session.date},' ',${ctx.session.time}`
		);

		const dbResult = await saveToDb(
			ctx.session.userId,
			ctx.session.name,
			miliSeconds
		);
		dbResult.insertedId
			? await ctx.reply("Schedule reminder is persisted")
			: await ctx.reply("Schedule reminder set is unsuccessful");
		ctx.scene.leave();
	}
);
const UPDATE_REMINDER = new Scenes.WizardScene(
	"UPDATE_REMINDER",
	async (ctx) => {
		const userList = users.map((user) => {
			return { text: user.name, callback_data: user.id };
		});
		await ctx.reply("Choose user", {
			reply_markup: {
				inline_keyboard: [userList],
			},
		});
		ctx.wizard.next();
	},
	async (ctx) => {
		let userId = ctx.callbackQuery.data;
		ctx.session.userId = userId;
		ctx.session.name = users[userId - 1].name;
		await ctx.reply(`You have selected ${ctx.session.name}`);

		await ctx.reply("Please enter new Date");
		ctx.wizard.next();
	},
	async (ctx) => {
		// Store previous input to session
		const date = ctx.message.text;
		ctx.session.date = date;
		//Now ask for new Input
		await ctx.reply("Enter time in HH:MM format");
		ctx.wizard.next();
	},
	async (ctx) => {
		// Store previous input to session
		const time = ctx.message.text;
		ctx.session.time = time;
		ctx.reply(`You have entered Time: ${ctx.session.time}`);

		ctx.wizard.next();
	},
	async (ctx) => {
		// Save new input to Database
		const timeStamp = createDate(ctx.session.date, ctx.session.time);
		console.log(ctx.session.name, timeStamp);
		const result = await updateReminder(ctx.session.name, timeStamp);
		result.modifiedCount == 1 && result.matchedCount == 1
			? ctx.reply("Reminder is updated successfully")
			: ctx.reply("Reminder is updated successfully");

		ctx.scene.leave();
	}
);
const DELETE_REMINDER = new Scenes.WizardScene(
	"DELETE_REMINDER",
	async (ctx) => {
		await ctx.reply("Enter userId to delete the reminder");
		ctx.wizard.next();
	},
	async (ctx) => {
		// store UserId in session
		ctx.session.userId = ctx.message.text;
		const result = await readReminderById(ctx.session.userId);
		await ctx.reply("List of Reminders associated with that user.");
		for (let i = 0; i < result.length; i++) {
			const deleteReminderBtn = [
				{ text: "DELETE", callback_data: result[i]._id },
			];
			await ctx.reply(
				`name : ${result[i].name} \n Date Time:${getDateFromTimeStamp(
					result[i].dateTime
				)}`,
				{
					reply_markup: {
						inline_keyboard: [deleteReminderBtn],
					},
				}
			);
		}

		ctx.wizard.next();
	},
	async (ctx) => {
		// store previous data in session
		let result;
		ctx.session.reminderId = ctx.callbackQuery.data;
		console.log(ctx.session.reminderId);

		result = await deleteReminderById(ctx.session.reminderId);

		console.log(result),
			result.deletedCount > 0
				? ctx.reply("Reminder is deleted successfully")
				: ctx.reply("Reminder is not deleted for this user");

		//)
		ctx.scene.leave();
	}
);
module.exports = { SET_REMINDER, UPDATE_REMINDER, DELETE_REMINDER };
