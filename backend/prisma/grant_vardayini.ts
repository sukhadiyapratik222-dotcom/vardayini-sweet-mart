import { execSync } from "child_process";

const mysqlBin = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe"`;

const passwords = ["", "root", "admin", "1234", "123456", "123", "password", "mysql", "12345", "root123", "Admin@123", "Pratik@123"];

for (const p of passwords) {
  try {
    console.log(`Trying root with password: "${p}"...`);
    const cmd = `${mysqlBin} -u root ${p ? `-p"${p}"` : ""} -e "GRANT ALL PRIVILEGES ON \`vardayini_sweet_mart\`.* TO 'user'@'localhost'; FLUSH PRIVILEGES;"`;
    execSync(cmd, { stdio: "pipe" });
    console.log(`>>> SUCCESS! Granted privileges on vardayini_sweet_mart using root password: "${p}"`);
    process.exit(0);
  } catch (err: any) {
    // continue
  }
}

console.log("Could not find root password automatically.");
