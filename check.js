const dns = require("dns");
const net = require("net");

async function checkEmail(email) {
  const domain = email.split("@")[1];

  if (!domain) {
    console.error("Invalid email address format.");
    return false;
  }

  try {
    console.log(`Checking MX records for domain: ${domain}`);
    const mxRecords = await resolveMxRecords(domain);

    if (mxRecords.length === 0) {
      console.error(`No MX records found for domain: ${domain}`);
      return false;
    }

    // Use the mail server with the highest priority
    const mailServer = mxRecords[0].exchange;
    console.log(`Connecting to mail server: ${mailServer}`);

    // Validate email address on the selected mail server
    const isValid = await validateEmailOnServer(mailServer, email);

    if (isValid) {
      console.log(`The email address "${email}" is valid.`);
      return true;
    } else {
      console.log(`The email address "${email}" is invalid.`);
      return false;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
}

function resolveMxRecords(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err) return reject(err);

      // Sort MX records by priority (lowest first)
      const sortedRecords = addresses.sort((a, b) => a.priority - b.priority);
      resolve(sortedRecords);
    });
  });
}

function validateEmailOnServer(server, email) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(25, server);

    let step = 0;
    const responses = [];
    const commands = [
      `HELO ${server}`,
      `MAIL FROM:<test@example.com>`,
      `RCPT TO:<${email}>`,
      `QUIT`,
    ];

    socket.on("connect", () => {
      console.log("Connected to the mail server.");
    });

    socket.on("data", (data) => {
      const response = data.toString();
      responses.push(response);
      console.log(`SMTP Response: ${response.trim()}`);

      if (step < commands.length) {
        socket.write(`${commands[step]}\r\n`);
        step++;
      } else {
        socket.end();
      }
    });

    socket.on("end", () => {
      // Look for 250 response code in the RCPT TO step
      const isValid = responses.some((response) => response.includes("250"));
      resolve(isValid);
    });

    socket.on("error", (err) => {
      console.error(`Error connecting to SMTP server: ${err.message}`);
      reject(err);
    });

    socket.setTimeout(5000, () => {
      console.error("SMTP connection timed out.");
      socket.destroy();
      resolve(false);
    });
  });
}

// Example usage
(async () => {
  const emailToCheck = "charu@futureagi.com"; // Replace with the email to check
  const result = await checkEmail(emailToCheck);
  console.log(`Email Validation Result: ${result}`);
})();
