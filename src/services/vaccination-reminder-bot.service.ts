import cron from 'node-cron';
import TelegramBot from 'node-telegram-bot-api';

import { Status } from '../database/models/animal';
import { healthRecordRepository } from '../repositories/health-record.repository';

const CRON_EXPRESSION_DAY_10 = '0 9 10 * *'; // 10th day of every month at 09:00
const CRON_EXPRESSION_DAY_25 = '0 9 25 * *'; // 25th day of every month at 09:00

// Для быстрого теста можно временно поставить:
// const CRON_EXPRESSION_DAY_10 = '* * * * *';
// const CRON_EXPRESSION_DAY_25 = '* * * * *';

const TIMEZONE = 'Europe/Minsk';

const toDate = (value: Date | string): Date => {
    return value instanceof Date ? value : new Date(value);
};

const formatDate = (value: Date | string): string => {
    const date = toDate(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
};

const getDaysLeft = (value: Date | string): number => {
    const target = toDate(value);
    const today = new Date();
    const midnightToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );
    const midnightTarget = new Date(
        target.getFullYear(),
        target.getMonth(),
        target.getDate(),
    );

    return Math.ceil(
        (midnightTarget.getTime() - midnightToday.getTime()) /
            (1000 * 60 * 60 * 24),
    );
};

const getDaysWord = (days: number): string => {
    const value = Math.abs(days) % 100;
    const last = value % 10;

    if (value > 10 && value < 20) {
        return 'дней';
    }

    if (last > 1 && last < 5) {
        return 'дня';
    }

    if (last === 1) {
        return 'день';
    }

    return 'дней';
};

const buildMessage = async (): Promise<string> => {
    const records = await healthRecordRepository.getUpcomingVaccinations([
        Status.HOMELESS,
        Status.PREPARATION,
    ]);

    const header = [
        '🐾 Напоминание о вакцинациях на следующий месяц',
        '⚠️ Не забудьте обработать от глистов за 10–14 дней до вакцинации',
        '',
        '📋 Список животных:',
        '',
    ];

    if (records.length === 0) {
        return [
            ...header,
            '✅ Животных на вакцинацию в следующем месяце нет.',
        ].join('\n');
    }

    const rows = records.map((record, index) => {
        const dueDate = record.next_due_date as unknown as Date | string;
        const daysLeft = getDaysLeft(dueDate);

        return `${index + 1}. ${record.animal.name} — до ${formatDate(
            dueDate,
        )} (осталось ${daysLeft} ${getDaysWord(daysLeft)})`;
    });

    return [...header, ...rows].join('\n');
};

const sendVaccinationReminder = async (): Promise<void> => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn(
            '[vaccination-reminder-bot] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID is not set',
        );
        return;
    }

    const bot = new TelegramBot(token, { polling: false });
    const message = await buildMessage();

    await bot.sendMessage(chatId, message);
};

export const scheduleVaccinationReminderBot = (): void => {
    cron.schedule(
        CRON_EXPRESSION_DAY_10,
        () => {
            void sendVaccinationReminder();
        },
        { timezone: TIMEZONE },
    );

    cron.schedule(
        CRON_EXPRESSION_DAY_25,
        () => {
            void sendVaccinationReminder();
        },
        { timezone: TIMEZONE },
    );

    console.log(
        `[vaccination-reminder-bot] Scheduled (${CRON_EXPRESSION_DAY_10} + ${CRON_EXPRESSION_DAY_25}, ${TIMEZONE})`,
    );
};
