import router from '@server/router/index'
import { cleanUserSession } from '@server/services/user'

async function executeDailyTasks(): Promise<void> {
  await cleanUserSession()
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.fetch(request, env, ctx)
  },

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (controller.cron) {
      case '0 0 * * *':
        await executeDailyTasks()
        break
    }
  },
}
