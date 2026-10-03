import './config';
import { createApp } from './app';
import { startLeaderboardResetJob } from './jobs/leaderboard-reset.job';
import { config } from './config';

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`TempleGym server running on port ${config.PORT} [${config.NODE_ENV}]`);
  startLeaderboardResetJob();
});
