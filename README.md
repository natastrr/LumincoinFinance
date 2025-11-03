# 💰LumincoinFinance💰

Educational project — a SPA application for personal finance management, built with Vanilla JS without using any frameworks or JS libraries.

The application allows users to register, log into their account, manage their balance, add and edit income and expenses, and view statistics in the form of charts.

---

## Main features:

* Authorization and registration — access to the application is only possible after registering;
* Balance management — the current balance is displayed in the left panel and can be changed by clicking;
* Income and expenses — creation, editing, and deletion of transactions;
* Categories — ability to create custom categories for income and expenses; if no categories exist, transactions cannot be created;
* Period selection — filtering transactions by predefined periods (today, week, month, year, all time) or by a custom interval using a calendar;
* Home page — income and expense charts with period selection;
* Automatic balance update — the balance is recalculated in real time when transactions are modified or deleted;
* Routing without page reload — navigation between pages (Home, Income and Expenses, Categories) is handled by a custom router.

---

## Project structure:

The application consists of 2 parts:

* **frontend** — an application built with Vanilla JavaScript without using any frameworks or JS libraries;
* **backend** — the server side, handling requests and storing user data.

```bash
frontend/
├── config/                # API configuration
└── src/
    ├── components/        # page logic
    ├── static/            # images and static files
    ├── styles/            # page style files
    ├── templates/         # HTML page templates
    ├── utils/             # utility functions
    ├── app.js             # application initialization
    └── router.js          # routing logic (SPA)
```

---

## Frontend tools:

* JavaScript (ES6+)
* Webpack
* Bootstrap (basic UI styling)
* Flatpickr (date picker)
* Chart.js (income and expense charts)
* Font Awesome (icons)

---

## How to run the project locally?

### 1. Install Node.js (v18.20.8) + npm

### 2. Clone the repository:
   `git clone https://github.com/natastrr/LumincoinFinance.git`
   
### 3. Install dependencies:

#### Backend:

1. `cd backend` (navigate from the project root to the backend directory)
2. `npm install`
3. `npm start`
   
The server will start on Node.js and handle requests. User data is stored in a local JSON database.

####  Frontend (in a new terminal):

1. `cd frontend` (navigate from the project root to the frontend directory)
2. `npm install`
3. `npm run dev`

After building, the application will be available at `http://localhost:1996`.

---

## Additional information:

* The project was created for educational purposes to practice the architecture of SPA applications using pure JavaScript;
* Custom routing and state management mechanisms have been implemented without using frameworks;
* A modular code structure and component-based approach are used.


---
---
---


# 💰LumincoinFinance💰

Учебный проект - SPA-приложение для учета личных финансов, созданное на Vanilla JS без использования фреймворков и JS-библиотек.

Приложение позволяет пользователю регистрироваться, входить в аккаунт, управлять балансом, добавлять и редактировать доходы и расходы, а также просматривать статистику в виде диаграмм.

---

## Основной функционал:

* Авторизация и регистрация — вход в приложение возможен только после регистрации;
* Управление балансом — текущий баланс отображается в левой панели и может быть изменен по клику;
* Доходы и расходы — создание, редактирование и удаление операций;
* Категории — возможность создавать собственные категории для доходов и расходов; если категории отсутствуют, операции создать нельзя;
* Выбор периода — фильтрация операций по предустановленным периодам (сегодня, неделя, месяц, год, все время) или по выбранному интервалу через календарь;
* Главная страница — диаграммы доходов и расходов с выбором периода;
* Автоматическое обновление баланса — при изменении или удалении операций баланс пересчитывается в реальном времени;
* Роутинг без перезагрузки — переход между страницами (Главная, Доходы и Расходы, Категории) осуществляется через собственный роутер.

---

## Структура проекта:

Приложение состоит из 2 частей:

* **frontend** - приложение на Vanilla JavaScript без использования фреймворков и JS-библиотек;
* **backend** - серверная часть, обрабатывающая запросы и хранящая данные пользователей.

```bash
frontend/
├── config/                # конфигурация API
└── src/
    ├── components/        # логика страниц
    ├── static/            # изображения и статические файлы
    ├── styles/            # файлы стилей страниц
    ├── templates/         # HTML-шаблоны страниц
    ├── utils/             # вспомогательные функции
    ├── app.js             # инициализация приложения
    └── router.js          # логика маршрутизации (SPA)
```

---

## Frontend-инструменты:

* JavaScript (ES6+)
* Webpack
* Bootstrap (базовая стилизация интерфейса)
* Flatpickr (выбор дат)
* Chart.js (диаграммы доходов и расходов)
* Font Awesome (иконки)

---

## Как локально запустить проект?

### 1. Установите Node.js (v18.20.8) + npm

### 2. Клонируйте репозиторий:
   `git clone https://github.com/natastrr/LumincoinFinance.git`
   
### 3. Установка зависимостей:

#### Backend:

1. `cd backend` (перейти из корня проекта в директорию backend)
2. `npm install`
3. `npm start`
   
Сервер запустится на Node.js и будет обрабатывать запросы. Данные пользователей хранятся в локальной JSON-базе.

####  Frontend (в новом терминале):

1. `cd frontend` (перейти из корня проекта в директорию frontend)
2. `npm install`
3. `npm run dev`

После сборки приложение будет доступно по адресу: `http://localhost:1996`

---

## Дополнительно:

* Проект создан в учебных целях для отработки архитектуры SPA-приложений на чистом JavaScript;
* Реализованы собственные механизмы роутинга и управления состоянием без использования фреймворков;
* Используется модульная структура кода и компонентный подход.
