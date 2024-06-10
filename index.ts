import { createApp } from './app';
import { AppDataSource } from './src/database';

const port = process.env.PORT ?? 1083;

const init = async () => {
    const app = createApp();

    await AppDataSource.initialize();

    app.listen(port, () => {
        console.log(`[*] Server started on port ${port}`);
    });
};

init();
