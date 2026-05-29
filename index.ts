import { createApp } from './app';
import { AppDataSource } from './src/database';
import { scheduleVaccinationReminderBot } from './src/services/vaccination-reminder-bot.service';

const port = process.env.PORT ?? 1083;

const init = async (): Promise<void> => {
    const app = createApp();

    await AppDataSource.initialize();

    scheduleVaccinationReminderBot();

    app.listen(port, () => {
        console.log(`[*] Server started on port ${port}`);
    });
};

void init();
