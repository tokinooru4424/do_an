import BullQueue from "./Bull";
import appConfig from "@root/config/app";

class Queue {
  static start() {
    let enableProcess = appConfig.ENABLE_PROCESS_QUEUE
    BullQueue.makeQueue()
    if (enableProcess) {
      BullQueue.makeProcess()
    }
  }
}

export default Queue