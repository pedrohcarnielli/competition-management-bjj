import { startLocalApp } from "./routes";
export * from "./functions";

if (require.main === module) {
  const port = parseInt(process.env.PORT || "3000", 10);
  startLocalApp(port);
}
