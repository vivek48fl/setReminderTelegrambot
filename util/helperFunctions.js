const { clientPromise } = require("./mongodbConnector");
const { ObjectId } = require("mongodb");
const saveToDb = async (userId, name, dateTime) => {
	const client = await clientPromise;
	const db = await client.db("test");
	const result = await db.collection("scheduler").insertOne({
		userId: userId,
		name: name,
		dateTime: dateTime,
	});
	client.close();
	return result;
};
const readReminders = async () => {
	const client = await clientPromise;
	const db = await client.db("test");
	const collection = await db.collection("scheduler");
	const reminders = collection.find({}).toArray();
	return reminders;
};
const updateReminder = async (name, dateTime) => {
	console.log("name in updateReminder", name);
	const client = await clientPromise;
	const db = await client.db("test");
	const collection = await db.collection("scheduler");
	const reminders = collection.updateOne(
		{ name: name },
		{ $set: { dateTime: dateTime } }
	);
	return reminders;
};
const getDateFromTimeStamp = (timeStamp) => {
	const dateTime = new Date(timeStamp);
	console.log(dateTime);
	const day = dateTime.getDate();
	const month = dateTime.getMonth();
	const year = dateTime.getFullYear();
	const hours = dateTime.getHours();
	const minutes = dateTime.getMinutes();
	let currentDate =
		day + "/" + month + "/" + year + " " + hours + ":" + minutes;
	return currentDate;
};
const createDate = (date, time) => {
	const newDates = date.split("/");
	const newTimes = time.split(":");
	console.log("newDates Array in createDate", newDates);
	const timeStamp = new Date(
		newDates[2],
		newDates[1],
		newDates[0],
		newTimes[0],
		newTimes[1]
	).getTime();

	console.log("Date Now", timeStamp);
	return timeStamp;
};
const readReminderById = async (id) => {
	const client = await clientPromise;
	const db = await client.db("test");
	const collection = await db.collection("scheduler");
	const result = await collection.find({ userId: id }).toArray();
	return result;
};
const deleteReminderById = async (id) => {
	const client = await clientPromise;
	const db = await client.db("test");
	const collection = await db.collection("scheduler");
	const result = await collection.deleteMany({ _id: ObjectId(id) });
	return result;
};
module.exports = {
	saveToDb,
	createDate,
	readReminders,
	readReminderById,
	updateReminder,
	getDateFromTimeStamp,
	deleteReminderById,
};
