# Historify

**Unearth Your Local History: Digitize, Connect, and Visualize.**

Historify is a comprehensive web application designed for local history enthusiasts to digitize, organize, and explore historical records and events. Transform physical documents into searchable digital archives and create compelling narratives of your local history.

![Historify Screenshot](docs/images/historify-hero.png)

## 🌟 Features

### 📄 Document Digitization & OCR
- Upload scanned documents (deeds, census records, newspapers)
- Advanced Optical Character Recognition (OCR) with multiple provider support
- Convert historical documents into searchable text
- Support for PDF, JPG, PNG, and TIFF formats

### 🔗 Cross-Archive Linking
- Manually link related documents, people, and events
- Create connections across different archives and sources
- Build comprehensive historical narratives
- Visual relationship mapping

### 📅 Thematic Event Timelines
- Curate historical events by themes (Immigration, Industrial Development, etc.)
- Associate documents with specific events
- Interactive timeline visualization
- Export timelines in multiple formats

### 🗺️ Geo-Historical Mapping
- Overlay historical maps onto modern interfaces
- Plot historical locations and events
- Property deed visualization with land plots
- Interactive map exploration with Leaflet.js

### 🔍 Advanced Search
- Full-text search across all documents
- Fuzzy search and exact phrase matching
- Advanced filtering by date, source, file type
- Search suggestions and auto-complete
- TF-IDF relevance scoring

### 💳 Subscription Management
- **Free Tier**: 10 documents, 100MB storage, 50 OCR pages/month
- **Basic Tier**: 100 documents, 1GB storage, 500 OCR pages/month ($5/month)
- **Premium Tier**: 1000 documents, 10GB storage, 2000 OCR pages/month ($15/month)
- Usage tracking and limit enforcement

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with JavaScript enabled
- (Optional) OCR API keys for production use

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/historify.git
   cd historify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_OCR_SERVICE_URL=https://api.ocr.space/parse/image
VITE_OCR_API_KEY=your_ocr_api_key

# Storage Configuration
VITE_STORAGE_PROVIDER=local
VITE_AWS_REGION=us-east-1
VITE_AWS_BUCKET=historify-documents

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBHOOKS=false
```

## 📖 Documentation

### User Guide
- [Getting Started](docs/user-guide/getting-started.md)
- [Document Upload](docs/user-guide/document-upload.md)
- [Search and Discovery](docs/user-guide/search.md)
- [Creating Timelines](docs/user-guide/timelines.md)
- [Map Features](docs/user-guide/maps.md)

### Developer Documentation
- [API Reference](docs/API.md)
- [Architecture Overview](docs/architecture.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Deployment Guide](docs/deployment.md)

## 🏗️ Architecture

Historify is built with modern web technologies:

### Frontend
- **React 18** - Component-based UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet.js** - Interactive mapping library
- **Lucide React** - Beautiful icon library

### Services & APIs
- **OCR Integration** - OCR.space, Google Vision, AWS Textract
- **Cloud Storage** - AWS S3, Google Cloud Storage, local storage
- **Search Engine** - Custom TF-IDF implementation with fuzzy search
- **Subscription Management** - Stripe integration ready

### Key Components

```
src/
├── components/          # React components
│   ├── AuthModal.jsx   # Authentication
│   ├── Dashboard.jsx   # Main dashboard
│   ├── DocumentUpload.jsx
│   ├── DocumentViewer.jsx
│   ├── Timeline.jsx    # Timeline visualization
│   └── MapView.jsx     # Geographic mapping
├── services/           # Business logic
│   ├── api.js         # API service layer
│   ├── subscription.js # Subscription management
│   └── search.js      # Advanced search
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── styles/            # CSS and styling
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

### Project Structure

```
historify/
├── public/             # Static assets
├── src/               # Source code
│   ├── components/    # React components
│   ├── services/      # Business logic services
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── styles/        # CSS and styling
├── docs/              # Documentation
├── tests/             # Test files
└── docker/            # Docker configuration
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Auto-fix linting issues
npm run lint -- --fix

# Format all files
npm run format
```

## 🐳 Docker Deployment

### Development with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d
```

### Production Deployment

```bash
# Build production image
docker build -t historify:latest .

# Run production container
docker run -p 80:80 historify:latest
```

### Docker Configuration

The application includes:
- Multi-stage Dockerfile for optimized production builds
- Docker Compose for development environment
- Health checks and proper signal handling
- Environment variable configuration

## 🔒 Security

### Data Protection
- All file uploads are validated and sanitized
- OCR processing is sandboxed
- User data is encrypted at rest
- HTTPS enforced in production

### Authentication
- JWT-based authentication
- Secure password hashing
- Session management
- Rate limiting on API endpoints

### Privacy
- GDPR compliant data handling
- User data export capabilities
- Right to deletion implementation
- Minimal data collection

## 📊 Performance

### Optimization Features
- Lazy loading of components and images
- Virtual scrolling for large document lists
- Image compression and thumbnail generation
- CDN integration for static assets
- Service worker for offline capabilities

### Monitoring
- Error tracking with comprehensive logging
- Performance metrics collection
- User analytics (privacy-focused)
- API response time monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Reporting Issues

Please use the [GitHub Issues](https://github.com/vistara-apps/historify/issues) page to report bugs or request features.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OCR.space** for OCR API services
- **Leaflet** for mapping capabilities
- **React** community for excellent tooling
- **Tailwind CSS** for the design system
- Historical societies and archives for inspiration

## 📞 Support

### Community Support
- [GitHub Discussions](https://github.com/vistara-apps/historify/discussions)
- [Discord Community](https://discord.gg/historify)
- [Documentation](https://docs.historify.com)

### Professional Support
- Email: support@historify.com
- Priority support available for Premium subscribers
- Custom deployment and integration services

## 🗺️ Roadmap

### Version 2.0 (Q2 2024)
- [ ] Real-time collaboration features
- [ ] Advanced AI-powered document analysis
- [ ] Mobile application (React Native)
- [ ] Bulk document processing
- [ ] Advanced export formats (GEDCOM, EAD)

### Version 2.1 (Q3 2024)
- [ ] Multi-language OCR support
- [ ] Advanced genealogy features
- [ ] Integration with major archives APIs
- [ ] Machine learning for automatic linking
- [ ] Advanced visualization tools

### Long-term Goals
- [ ] Blockchain-based document verification
- [ ] AR/VR historical exploration
- [ ] Community sharing and collaboration
- [ ] Educational institution partnerships

## 📈 Statistics

- **Languages**: JavaScript, CSS, HTML
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier
- **Deployment**: Docker, Vercel, AWS

---

**Made with ❤️ for history enthusiasts and researchers worldwide.**

For more information, visit [historify.com](https://historify.com) or check out our [documentation](https://docs.historify.com).
