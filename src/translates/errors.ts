const EN = {
    AUTH_REQUIRED: 'Authorization required',
    TOKEN_REQUIRED: 'A token is required for authentication',
    EXTERNAL_SERVICE_ERROR: 'External service error',
    ANIMAL_NOT_FOUND: 'Animal not found',
};

export const errors: Record<string, Record<keyof typeof EN, string>> = {
    EN,
    RU: {
        AUTH_REQUIRED: 'Аутентификация обязательна',
        TOKEN_REQUIRED: 'Для аутентификации требуется токен доступа',
        EXTERNAL_SERVICE_ERROR: 'Ошибка стороннего сервиса',
        ANIMAL_NOT_FOUND: 'Животное не найдено',
    },
};
