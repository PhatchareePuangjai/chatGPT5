inventory_full_version/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── db/
│   │   ├── index.js
│   │   └── schema.sql
│   ├── services/
│   │   └── stockService.js        # SALE, RESTOCK/RETURN, atomic, concurrency-safe
│   ├── controllers/
│   │   └── stockController.js     # history + alerts endpoints
│   └── routes/
│       └── stockRoutes.js
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── styles.css
        └── components/
            └── StockDashboard.tsx  # stock, low stock, history, alerts, purchase form

cd backend
cp .env.example .env   # edit DB credentials
createdb inventory_db
psql inventory_db -f db/schema.sql
npm install
npm run start


cd frontend
npm install
npm run dev


Backend: http://localhost:4000/api/stock
Frontend: http://localhost:5173/