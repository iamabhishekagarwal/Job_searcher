import { config } from "dotenv"
import { anonymizeProxy } from "proxy-chain"

config()

const originialProxy=process.env.PROXY;

const anonymizedProxy=anonymizeProxy(originialProxy);

export default anonymizedProxy;