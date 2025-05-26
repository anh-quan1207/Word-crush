# Word Crush - Game Nối Từ Nhiều Người Chơi

Word Crush là một trò chơi nối từ trực tuyến nhiều người chơi, sử dụng công nghệ Socket.IO. Người chơi tạo hoặc tham gia phòng, rồi lần lượt nhập từ bắt đầu bằng chữ cái cuối cùng của từ trước đó.

## Tính năng

- Tạo và tham gia phòng chơi bằng mã phòng
- Hệ thống chat trong phòng chờ
- Luật chơi nối từ: nhập từ bắt đầu bằng chữ cái cuối của từ trước đó
- Hệ thống báo cáo từ không hợp lệ
- Chế độ thời gian giới hạn (30 giây mỗi lượt)
- Bảng xếp hạng người thua cuối mỗi trận đấu

## Cài đặt và Chạy

### Sử dụng npm

1. Clone repository:
```
git clone https://github.com/your-username/word-crush.git
cd word-crush
```

2. Cài đặt dependencies:
```
npm install
cd client && npm install
```

3. Chạy ứng dụng (development mode):
```
npm run dev
```

### Sử dụng Docker

1. Build và chạy containers:
```
docker-compose up --build
```

## Công nghệ sử dụng

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React, TypeScript, Tailwind CSS
- **Containerization**: Docker

## Cấu trúc dự án

```
word-crush/
├── client/                   # React frontend
│   ├── public/               # Static files
│   └── src/                  # Source code
│       ├── components/       # UI components
│       ├── contexts/         # React contexts
│       └── pages/            # App pages
├── server/                   # Node.js backend
│   └── server.js             # Main server file
├── docker-compose.yml        # Docker configuration
├── Dockerfile.client         # Client Docker configuration
├── Dockerfile.server         # Server Docker configuration
└── package.json              # Dependencies and scripts
``` 