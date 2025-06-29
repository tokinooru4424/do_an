import Bull from 'bull'
import configRedis from 'config/redis'
import _ from 'lodash'

const { REDIS_HOST, REDIS_PORT, REDIS_PASS, REDIS_QUEUE_DB, REDIS_QUEUE_PREFIX } = configRedis

class BullService {
  static _queues = {}
  static _jobCallback = {}

  static getRandom(length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
  }

  static getAllQueueName() {
    return Object.keys(this._queues)
  }

  static queue(name) {
    return this._queues[name]
  }

  static setQueue(name, queue) {
    this._queues[name] = queue
  }

  static async createJob(queueName, data, {
    delay = 0,
    attempts = 1,
    ttl = 30000,
    backoff = 0,
    repeat = undefined,
    name = undefined,
    fnCompleted = undefined,
    fnFailed = undefined
  } = {}) {
    let queue = this.queue(queueName)
    //tạo callbackjob
    let newJobCallbackId

    do {
      newJobCallbackId = Date.now().toString() + this.getRandom(10)
    }
    while (this._jobCallback[newJobCallbackId])

    let promise = new Promise((resolve, reject) => {
      this._jobCallback[newJobCallbackId] = {
        resolve: (data) => {
          if (typeof fnCompleted == "function") fnCompleted(data)
          resolve(data)
        },
        reject: error => {
          if (typeof fnFailed == "function") fnFailed(data)
          console.log("reject")
          reject(error)
        }
      }
    })

    data['_callbackId'] = newJobCallbackId

    if (!name) {
      queue.add(data, {
        delay: delay,
        attempts: attempts,
        timeout: ttl,
        repeat: repeat,
        backoff: {
          type: 'fixed',
          delay: backoff
        }
        //removeOnComplete: true,
        //removeOnFail: true
      })
    }
    else {
      queue.add(name, data, {
        delay: delay,
        attempts: attempts,
        timeout: ttl,
        repeat: repeat,
        backoff: {
          type: 'fixed',
          delay: backoff
        }
        //removeOnComplete: true,
        //removeOnFail: true
      })
    }
    return promise
  }

  static createQueue(name) {
    let redisQueueName = `${name}-${REDIS_QUEUE_DB}`

    const queue = new Bull(redisQueueName, {
      prefix: REDIS_QUEUE_PREFIX,
      redis: {
        port: REDIS_PORT,
        host: REDIS_HOST,
        password: REDIS_PASS,
        db: REDIS_QUEUE_DB, // if provided select a non-default redis db
      }
    })

    queue.on("global:completed", async (jobId, result) => {
      let job = await queue.getJob(jobId)
      if (!job) return //not found job

      console.log("completed job: #", job.id)

      if (job.data['_callbackId'] && this._jobCallback[job.data['_callbackId']]) {
        try {
          result = JSON.parse(result)
        }
        catch (e) {
          //skip
        }
        this._jobCallback[job.data['_callbackId']].resolve(result)
        delete this._jobCallback[job.data['_callbackId']]
        //job.remove();
      }
    })

    queue.on("global:failed", async (jobId, result) => {
      let job = await queue.getJob(jobId)
      if (!job) return //not found job

      if (job.opts.attempts !== job.attemptsMade) {
        console.log(`failed attempts(${job.attemptsMade}/${job.opts.attempts}) job: #`, job.id)
        return
      }

      console.log("failed job: #", job.id)

      if (job.data['_callbackId'] && this._jobCallback[job.data['_callbackId']]) {
        try {
          result = JSON.parse(result)
          result['jobId'] = job.id
        }
        catch (e) {
          //skip
        }
        this._jobCallback[job.data['_callbackId']].reject(result)
      }
    })

    queue.on("global:active", (jobId, result) => {
      //  console.log("active job: ", jobId)
    })

    queue.on("active", (job, result) => {
      if (!job) return //not found job
      console.log("this server will process job: #", job.id)
    })

    this.setQueue(name, queue)
  }

  static createProcess(name, fn, thread = 4) {
    if (!this.queue(name)) {
      this.createQueue(name)
    }
    let queue = this.queue(name)
    queue.process(thread, fn)
  }

  static clearQueue(name, mins) {
    let queue = this.queue(name)
    queue.clean(mins * 86400 * 1000)
    queue.clean(mins * 86400 * 1000, 'failed');
  }
}

export default BullService
