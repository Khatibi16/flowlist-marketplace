# FlowList - AI-Driven Marketplace

FlowList is a two-sided platform helping retailers turn excess stock into sales through seamlessly integrated, multi-agent AI-driven tools. Sellers snap photos and get instant descriptions and pricing suggestions, while buyers enjoy a guided, chat-based shopping experience with mix-and-match styling, filters, and smart recommendations.

## 🚀 Features

### For Sellers
- **AI-Powered Listing**: Snap photos and get instant descriptions, pricing suggestions, and smart categorization
- **Smart Pricing**: AI-driven price optimization and market analysis for maximum sales potential
- **Automated Management**: Dashboard to manage inventory, track sales, and monitor performance
- **Multi-Channel Integration**: List across multiple platforms automatically

### For Buyers
- **Chat-Based Shopping**: Guided shopping experience with AI assistant
- **Smart Recommendations**: Personalized product suggestions based on preferences
- **Mix-and-Match Styling**: AI-powered outfit combinations and styling advice
- **Secure Transactions**: Safe and secure payment processing with buyer protection

### AI & ML Features
- **Automated Listing Generation**: AI creates product descriptions and tags
- **Dynamic Pricing Optimization**: Real-time price adjustments based on market data
- **Intelligent Customer Support**: AI-powered chat assistance
- **Fraud Detection**: Advanced security and fraud prevention

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **JWT** - Authentication tokens

## 📁 Project Structure

```
flowlist-project/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── models/             # Data models
│   ├── middleware/         # Custom middleware
│   └── package.json
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flowlist-project
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the frontend (React) and backend (Node.js) servers concurrently.

### Individual Server Commands

- **Start only the backend server**:
  ```bash
  npm run server
  ```

- **Start only the frontend server**:
  ```bash
  npm run client
  ```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔑 Demo Credentials

### Seller Account
- **Email**: seller@flowlist.com
- **Password**: password123

### Buyer Account
- **Email**: buyer@flowlist.com
- **Password**: password123

## 📱 Key Pages

### Public Pages
- **Home** (`/`) - Landing page with features and benefits
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration

### Seller Pages
- **Dashboard** (`/seller`) - Product management and analytics
- **Product Upload** - AI-powered product listing

### Buyer Pages
- **Shop** (`/buyer`) - Product discovery and search
- **Product Detail** (`/product/:id`) - Individual product pages
- **Chat** (`/chat/:sessionId`) - AI shopping assistant

### User Pages
- **Profile** (`/profile`) - User account management

## 🤖 AI Integration Points

The application is designed to easily integrate with AI/ML services:

1. **Image Analysis** - `/api/upload/analyze` endpoint for product image analysis
2. **Chat AI** - `/api/chat/ai/recommendations` for intelligent responses
3. **Pricing AI** - Product pricing optimization algorithms
4. **Recommendation Engine** - Personalized product suggestions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Chat
- `GET /api/chat/sessions/:userId` - Get user chat sessions
- `GET /api/chat/:sessionId/messages` - Get chat messages
- `POST /api/chat/:sessionId/messages` - Send message
- `POST /api/chat/ai/recommendations` - Get AI recommendations

### Upload
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images
- `POST /api/upload/analyze` - Analyze uploaded image

## 🎨 Design System

The application uses a modern design system with:
- **Color Palette**: Purple and blue gradients with gray accents
- **Typography**: Inter font family
- **Components**: Reusable card, button, and input components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant design

## 🚀 Future Enhancements

### Phase 1: Core Features
- [ ] Real AI/ML integration
- [ ] Payment processing
- [ ] Email notifications
- [ ] Advanced search filters

### Phase 2: Advanced Features
- [ ] Mobile app (React Native)
- [ ] Real-time chat
- [ ] Video product demos
- [ ] Social features

### Phase 3: Scale
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] API for third-party integrations
- [ ] Enterprise features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@flowlist.com or join our Slack channel.

---

**FlowList** - Transforming retail through AI-powered commerce 🚀
