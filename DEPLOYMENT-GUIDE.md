# Global Social - Replit Deployment Guide

## Quick Deployment

### One-Click Deploy
1. Click **"Deploy"** button in top-right of Replit workspace
2. Select **"Autoscale Deployment"** 
3. Configure machine power: **1 vCPU, 2GB RAM**
4. Set max instances: **5-10** based on expected traffic
5. Click **"Deploy"** - your app will be live at `<app-name>.replit.app`

### Health Check
- Verify deployment: `https://<app-name>.replit.app/api/health`
- Should return: `{"status":"healthy","version":"2025.1.0",...}`

## Pre-Deployment Checklist

### ✅ Required Secrets (In Replit Secrets)
- `REDDIT_CLIENT_ID` - Reddit app client ID
- `REDDIT_CLIENT_SECRET` - Reddit app secret key  
- `REDDIT_USER_AGENT` - Reddit API user agent string
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `JWT_SECRET` - Secure random string for authentication

### ✅ Database Setup
- Database automatically provisioned by Replit
- `DATABASE_URL` environment variable auto-configured
- Connection pooling optimized for Neon PostgreSQL

### ✅ Environment Configuration
- `NODE_ENV=production` set automatically in deployment
- Port 5000 configured for HTTP traffic
- HTTPS/SSL certificates handled by Replit

## Production Features

### ✅ Autoscaling Configuration
- **Scale to Zero**: App scales down after 15 minutes of inactivity
- **Auto Scale Up**: Adds instances at 80 concurrent requests
- **Cost Optimization**: Pay only for active compute time
- **Target**: < $20/month for moderate traffic

### ✅ Database Optimization
- **Serverless PostgreSQL**: Neon database with auto-scaling
- **Idle Management**: Database pauses after 5 minutes of inactivity
- **Performance**: Connection pooling with 20 max connections
- **Backup**: Point-in-time restore capability

### ✅ Monitoring & Health
- **Health Endpoint**: `/api/health` for deployment monitoring
- **Performance Metrics**: Real-time request latency tracking
- **Error Handling**: Comprehensive exception management
- **Logging**: Structured request/response logging

## Replit-Specific Optimizations

### Infrastructure Benefits
- **Cold Start**: < 2 seconds (Replit's 2025 optimization)
- **Geographic**: Global CDN with edge locations
- **Security**: Built-in DDoS protection and SSL
- **Domains**: Custom domain support with certificates

### Cost Structure
- **Free Tier**: Development and testing
- **Autoscale**: $1/month base + usage-based compute
- **Compute Units**: Based on CPU/RAM configuration
- **Database**: Neon PostgreSQL with pay-per-use model

## Environment Variables Reference

### Automatic (Replit-Managed)
```bash
DATABASE_URL=<neon-postgresql-connection-string>
PGHOST=<database-host>
PGUSER=<database-user>
PGPASSWORD=<database-password>
PGDATABASE=<database-name>
PGPORT=<database-port>
NODE_ENV=production
PORT=5000
REPLIT_DOMAINS=<your-deployment-domain>
```

### Required Secrets (User-Configured)
```bash
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=GlobalSocial/1.0
OPENAI_API_KEY=sk-your-openai-api-key
JWT_SECRET=your-secure-jwt-secret-256-bits
```

## Reddit App Configuration

### Create Reddit App
1. Go to [reddit.com/prefs/apps](https://reddit.com/prefs/apps)
2. Click **"Create App"** or **"Create Another App"**
3. Fill in details:
   - **Name**: Global Social
   - **App type**: Web app
   - **Description**: AI-powered social commerce platform
   - **About URL**: `https://<app-name>.replit.app/about`
   - **Redirect URI**: `https://<app-name>.replit.app/api/reddit/callback`
4. Save app credentials in Replit Secrets

### Test Reddit Integration
```bash
curl "https://<app-name>.replit.app/api/reddit/auth"
# Should return: {"authUrl": "https://www.reddit.com/api/v1/authorize?..."}
```

## Performance Optimization

### Frontend Optimizations
- **Vite Build**: Optimized production bundle
- **Code Splitting**: Lazy-loaded components
- **Asset Optimization**: SVG icons and optimized images
- **Caching**: Browser caching headers for static assets

### Backend Optimizations
- **Connection Pooling**: Efficient database connections
- **Error Handling**: Prevents crashes and restarts
- **Stateless Design**: Compatible with autoscaling
- **Graceful Shutdown**: Clean process termination

### Database Optimizations
- **Query Optimization**: Efficient Drizzle ORM queries
- **Indexing**: Proper database indexes for performance
- **Connection Management**: Optimized for Neon serverless
- **Caching**: Application-level caching where appropriate

## Monitoring & Analytics

### Built-in Monitoring
- **Replit Dashboard**: Deployment status and metrics
- **Usage Analytics**: Compute units and resource consumption
- **Performance Tracking**: Request latency and throughput
- **Error Monitoring**: Automatic error detection and alerts

### Custom Monitoring
```bash
# Health check endpoint
GET /api/health

# Response includes:
{
  "status": "healthy",
  "uptime": 1234.56,
  "memory": {...},
  "features": {
    "reddit_integration": true,
    "openai_enabled": true,
    "database_connected": true
  }
}
```

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure user authentication
- **Session Management**: Encrypted session storage
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive data sanitization

### Data Protection
- **Secrets Management**: Encrypted environment variables
- **HTTPS Only**: All traffic encrypted in transit
- **SQL Injection Prevention**: ORM-based database access
- **CORS Configuration**: Proper cross-origin policies

## Scaling Strategy

### Traffic Patterns
- **Low Traffic**: 1 instance, scales to zero
- **Medium Traffic**: 2-3 instances during peak hours
- **High Traffic**: Auto-scale up to configured maximum
- **Global Users**: Edge caching and CDN optimization

### Resource Allocation
- **CPU**: 0.5-1 vCPU per instance
- **Memory**: 1-2 GB RAM per instance
- **Database**: Serverless with auto-scaling
- **Storage**: Persistent storage for user uploads

## Troubleshooting

### Common Issues

#### Deployment Fails
- Check all required secrets are configured
- Verify Reddit app redirect URI matches deployment domain
- Ensure database connection is healthy

#### API Errors
- Check OpenAI API key validity and credits
- Verify Reddit OAuth credentials
- Monitor rate limiting on external APIs

#### Performance Issues
- Review health check endpoint for resource usage
- Check database connection pool status
- Monitor autoscaling behavior in Replit dashboard

### Debug Commands
```bash
# Test health endpoint
curl https://<app-name>.replit.app/api/health

# Test Reddit integration
curl https://<app-name>.replit.app/api/reddit/feed?location=NewYork&limit=5

# Test database connection
curl https://<app-name>.replit.app/api/auth/user
```

## Support & Maintenance

### Regular Maintenance
- **Dependency Updates**: Monthly package updates
- **Security Patches**: Automatic Replit platform updates
- **Database Optimization**: Quarterly performance review
- **Monitoring Review**: Weekly metrics analysis

### Backup Strategy
- **Database Backups**: Neon automatic point-in-time restore
- **Code Backups**: Git repository with deployment tags
- **Configuration Backup**: Document all environment variables
- **Recovery Testing**: Quarterly disaster recovery tests

## Cost Optimization

### Replit Pricing (2025)
- **Replit Core**: $20-25/month (includes $25 credits)
- **Autoscale Deployment**: $1/month + compute units
- **Database**: Usage-based billing (Neon PostgreSQL)
- **Estimated Total**: $15-30/month for moderate traffic

### Cost Reduction Tips
- **Scale to Zero**: Automatic during idle periods
- **Efficient Queries**: Optimize database performance
- **Resource Right-Sizing**: Match instance size to actual needs
- **Monitoring**: Track usage patterns for optimization

## Next Steps

### Phase 1: Launch (Complete)
- ✅ Deploy to Replit Autoscale
- ✅ Configure all required secrets
- ✅ Test Reddit and OpenAI integrations
- ✅ Verify health monitoring

### Phase 2: Scale (Upcoming)
- [ ] Custom domain configuration
- [ ] Advanced analytics integration
- [ ] Performance optimization based on real usage
- [ ] Multi-region considerations

### Phase 3: Enterprise (Future)
- [ ] Advanced security features
- [ ] Compliance certifications
- [ ] Enterprise-grade monitoring
- [ ] Custom SLA agreements

---

**Ready to Deploy?** Click the Deploy button in your Replit workspace and follow this guide for a production-ready Global Social deployment!