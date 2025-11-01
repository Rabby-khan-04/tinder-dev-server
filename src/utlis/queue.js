const Bee = require("bee-queue");
const sendMail = require("../helper/sendMail");

const redisOptions = { host: "127.0.0.1", port: 6379 };

const emailQueue = new Bee("email", { redis: redisOptions });

emailQueue.process(1, async (job) => {
  await sendMail(
    job.data.email,
    job.data.subject,
    job.data.text,
    job.data.html
  );

  await new Promise((r) => setTimeout(r, 3000));
  return true;
});

module.exports = emailQueue;
