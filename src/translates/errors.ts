const EN = {
    AUTH_REQUIRED: 'Authorization required',
    TOKEN_REQUIRED: 'A token is required for authentication',
    FORBIDDEN: 'Forbidden',
    EXTERNAL_SERVICE_ERROR: 'External service error',
    ANIMAL_NOT_FOUND: 'Animal not found',
    S3_SERVER_ERROR: 'Server error (S3)',
    S3_KEY_REQUIRED: 'S3 key required',
    S3_DELETE_ERROR: 'S3 delete error',
    ONLY_IMAGES_ALLOWED: 'Only images are allowed',
    DOG_HEIGHT_REQUIRED: 'Height required for dogs',
    IMAGE_NOT_FOUND: 'Image not found',
    IMAGE_IS_NOT_RELATED_TO_ANIMAL: 'Image is not related to the animal',
    ORDER_IS_BIGGER_THAN_IMAGES_COUNT: 'Order is bigger than images count',
};

export const errors: Record<string, Record<keyof typeof EN, string>> = {
    EN,
    RU: {
        AUTH_REQUIRED: 'Аутентификация обязательна',
        TOKEN_REQUIRED: 'Для аутентификации требуется токен доступа',
        EXTERNAL_SERVICE_ERROR: 'Ошибка стороннего сервиса',
        ANIMAL_NOT_FOUND: 'Животное не найдено',
        S3_SERVER_ERROR: 'Серверная ошибка (S3)',
        S3_KEY_REQUIRED: 'Обязателен ключ для удаления картинка',
        S3_DELETE_ERROR: 'Не удалось удалить картинку',
        ONLY_IMAGES_ALLOWED: 'Разрешены только картинки',
        DOG_HEIGHT_REQUIRED: 'Рост в холке обязателен к заполнению для собак',
        FORBIDDEN: 'Недостаточно прав',
        IMAGE_NOT_FOUND: 'Картинка не найдена',
        IMAGE_IS_NOT_RELATED_TO_ANIMAL: 'Картинка не относится к указанному животному',
        ORDER_IS_BIGGER_THAN_IMAGES_COUNT: 'Очередность картинки не может быть больше чем количество картинок',
    },
};
