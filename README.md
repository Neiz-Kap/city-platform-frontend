# ODS City Frontend

Фронтенд панели мониторинга обращений граждан на Next.js 16, React 19 и TanStack Query.

## Что есть сейчас

- таблица жалоб с фильтрами, метками и realtime-обновлением
- карточка статистики по периодам
- управление источниками VK / Email
- отдельное управление метками дашборда
- standalone Docker build и docker-compose для локального запуска

## Запуск локально

```bash
pnpm install
pnpm dev
```

Приложение ожидает переменную окружения:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-host.example.com
```

## Полезные команды

```bash
pnpm lint
pnpm typecheck
pnpm check
pnpm build
```

## Архитектурные заметки

- App Router: `app/dashboard/(guest)`
- Серверное состояние: TanStack Query v5
- HTTP-клиент: `ky`
- Realtime: `socket.io-client`
- UI: shadcn/ui + Tailwind CSS 4

## Ключевые UX-фичи

- URL-состояние таблицы жалоб и блока статистики
- единый центр уведомлений в шапке
- optimistic updates для источников и меток
- нормализованные API-ошибки для toast и экранных состояний
