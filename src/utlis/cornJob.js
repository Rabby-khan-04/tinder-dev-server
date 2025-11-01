const corn = require("node-cron");
const Connection = require("../models/connection");
const sendMail = require("../helper/sendMail");
const { subDays } = require("date-fns");
// const emailQueue = require("./queue");

corn.schedule("1 19 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterDayStart = new Date(
      Date.UTC(
        yesterday.getUTCFullYear(),
        yesterday.getUTCMonth(),
        yesterday.getUTCDate(),
        0,
        0,
        0
      )
    );
    const yesterDayEnd = new Date(
      Date.UTC(
        yesterday.getUTCFullYear(),
        yesterday.getUTCMonth(),
        yesterday.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    const pendingConnection = await Connection.find({
      status: "interested",
      createdAt: { $gte: yesterDayStart, $lte: yesterDayEnd },
    }).populate("toUserId");

    const userWhoGotRequest = [
      ...new Set(
        pendingConnection.map((connection) => connection.toUserId.email)
      ),
    ];

    for (let email of userWhoGotRequest) {
      sendMail(
        email,
        "Testing node-cron",
        "", // plain text body (optional)
        `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #007bff;">Hey there!</h2>
      <p>So, funny story — I don’t actually know you. I’m just testing a project with some totally made-up data, and apparently, your name wandered into my experiment.</p>
      <p>If you got this email, congrats! You’ve been randomly selected by the universe (and my code).</p>
      <p>Feel free to ignore or block it, unless you <strong>enjoy</strong> mysterious messages from strangers. Otherwise, you might keep getting my test emails at exactly <strong>5:00 PM</strong> every day — like clockwork.</p>
      <p>Sorry in advance… and also kinda not sorry. 😜</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 0.9em; color: #888;">— The Accidental Email Tester</p>
    </div>
  `
      );
    }
  } catch (error) {
    console.log(error);
  }
});
