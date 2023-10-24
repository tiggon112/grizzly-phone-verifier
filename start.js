require("dotenv").config();
const axios = require("axios");

const prompt = require("prompt-sync")();
const api_key = process.env.GRIZZLY_API_KEY;
const service = process.env.SERVICE_CODE;

const main = async () => {
  try {
    while (1) {
      prompt("Press Enter to continue.");

      const result = await axios(
        `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getBalance`
      );

      console.log(result.data);

      let activation_id, phone_number;
      const phoneRequestResult = await axios(
        `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getNumber&service=${service}&country=${36}`
      );
      console.log(phoneRequestResult.data.split(":")[0]);
      if (phoneRequestResult.data.split(":")[0] == "ACCESS_NUMBER") {
        [_, activation_id, phone_number] = phoneRequestResult.data.split(":");
      } else continue;

      const statusChangeResult = await axios(
        `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=setStatus&status=${1}&id=${activation_id}`
      );
      if (statusChangeResult.data.split(":")[0] == "ACCESS_READY") {
        const isN = prompt(
          `Phone number ${phone_number} is available now. Please press Enter if you are ready to get code`
        );
        if (isN == "n") {
          await axios(
            `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=setStatus&status=${-1}&id=${activation_id}`
          );
          continue;
        }
      } else continue;

      for (let i = 0; i < 20; i++) {
        const getStatusResult = await axios(
          `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getStatus&id=${activation_id}`
        );
        console.log(getStatusResult.data.split(":")[0]);
        if (getStatusResult.data.split(":")[0] == "STATUS_OK") {
          const [_, code] = getStatusResult.data.split(":");
          console.log("Received a code: ", code);
        }
        await new Promise((resolve, reject) =>
          setTimeout(() => resolve(), 1000)
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
};

main();
