import { createApp } from './app';

const port = process.env.PORT ?? 1083;

void createApp().then((app) => {
  app.listen(port, () => {
    console.log(`[*] Server started on port ${port}`);
  });
});
