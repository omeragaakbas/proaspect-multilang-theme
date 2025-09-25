# ProAspect - Complete Usage Instructions

ProAspect is a comprehensive time tracking and invoicing platform for Dutch ZZP'ers (freelancers). This guide covers both user and admin functionality.

## 🚀 Quick Start

### For New Users
1. **Register**: Visit `/register` and create your account with:
   - Personal details (name, email, password)
   - Company information (company name, KvK, VAT number, IBAN)
   - Default hourly rate and preferences
2. **Email Verification**: Check your email and verify your account
3. **Login**: Access `/login` with your credentials
4. **Dashboard**: You'll be redirected to the main dashboard at `/dashboard`

### For Existing Users
1. Go to `/login`
2. Enter your email and password
3. Access your personalized dashboard

## 📊 Dashboard Overview

The main dashboard (`/dashboard`) provides:

### Quick Stats Cards
- **Total Hours**: Shows total hours worked this period with progress bar
- **Total Revenue**: Current period revenue with average hourly rate
- **Outstanding Invoices**: Number and total amount of unpaid invoices  
- **Paid Invoices**: Count of successfully paid invoices

### Quick Actions
- **Log Time**: Quick access to time entry
- **Create Invoice**: Generate new invoices
- **Add Client**: Manage client database
- **View Reports**: Access analytics and reports

### Real-time Charts
- **Daily Hours**: Line chart showing daily time tracking trends
- **Daily Revenue**: Bar chart of daily earnings
- **Recent Activities**: Latest time entries and invoices

## ⏰ Time Entry System (`/dashboard/time`)

### Week View Interface
- **Calendar View**: 7-day week layout with today highlighted
- **Navigation**: Previous/next week controls and "This Week" button
- **Daily Totals**: Hours per day displayed on each calendar card

### Adding Time Entries
1. **Quick Add**: Click "+" on any calendar day
2. **Timer Feature**: Use built-in timer with play/pause/stop controls
3. **Manual Entry**: Fill in:
   - Date (calendar picker)
   - Project (dropdown with client info)
   - Start and end times
   - Total hours (calculated automatically)
   - Description of work performed

### Entry Status Management
- **DRAFT**: Save work in progress
- **SUBMITTED**: Submit for client approval
- **APPROVED**: Approved entries ready for invoicing
- **REJECTED**: Entries requiring revision

### Bulk Operations
- Select multiple entries for batch actions
- Submit multiple drafts at once
- Generate invoices from approved entries

## 👥 Client Management (`/dashboard/clients`)

### Client Database
- **Search & Filter**: Find clients by name or contact
- **Client Cards**: Visual overview showing:
  - Company name and contact info
  - Project count and total hours
  - Active/archived status

### Adding New Clients
Complete client form includes:
- **Company Details**: Name, contact person
- **Contact Information**: Email addresses for communication and billing
- **Address**: Full postal address for invoicing
- **Settings**: Default rates and preferences

### Client Actions
- **Edit**: Modify client information
- **Archive/Activate**: Manage client status
- **View Projects**: See all projects for client
- **Generate Reports**: Client-specific analytics

## 🧾 Invoice Management (`/dashboard/invoices`)

### Invoice Lifecycle
1. **DRAFT**: Create and edit invoices
2. **SENT**: Invoices sent to clients
3. **PAID**: Successfully paid invoices
4. **OVERDUE**: Payment deadline passed
5. **CANCELLED**: Cancelled invoices

### Creating Invoices
1. **From Time Entries**: Auto-generate from approved time entries
2. **Manual Creation**: Create custom invoices with line items
3. **Templates**: Use predefined invoice templates

### Invoice Features
- **Professional Layouts**: Clean, branded invoice designs
- **VAT Handling**: Automatic VAT calculations (21% default)
- **Multiple Formats**: PDF and UBL (Dutch standard) formats
- **Payment Tracking**: Monitor payment status and due dates

### Line Items
- **Description**: Work performed or products delivered
- **Quantity**: Hours worked or items delivered  
- **Unit Price**: Rate per hour or item price
- **Total**: Automatic calculations with VAT

## ✅ Approval Workflow (`/dashboard/approvals`)

### For Contractors
- **Submit Entries**: Send time entries for client approval
- **Track Status**: Monitor approval progress
- **Handle Rejections**: Address feedback and resubmit
- **Bulk Actions**: Submit multiple entries simultaneously

### Approval States
- **PENDING**: Awaiting client review
- **APPROVED**: Ready for invoicing
- **REJECTED**: Requires attention and resubmission
- **EXPIRED**: Approval window closed

### Communication
- **Comments**: Exchange feedback on time entries
- **Notifications**: Real-time updates on status changes
- **Audit Trail**: Complete history of changes and approvals

## 📈 Reports & Analytics (`/dashboard/reports`)

### Financial Reports
- **Revenue Analysis**: Monthly and quarterly revenue trends
- **Client Breakdown**: Revenue distribution by client
- **Payment Status**: Outstanding vs. paid invoice analysis
- **Profitability**: Margin analysis and hourly rate optimization

### Time Analytics
- **Productivity Metrics**: Hours worked trends and patterns
- **Project Performance**: Time allocation across projects
- **Client Analysis**: Hours and revenue per client
- **Efficiency Reports**: Billable vs. non-billable time

### Export Options
- **PDF Reports**: Professional formatted reports
- **Excel Export**: Raw data for further analysis
- **Period Selection**: Custom date ranges
- **Filtered Views**: Client or project specific reports

## 🛠 Admin Features

### System Administration
- **User Management**: Monitor contractor accounts
- **System Settings**: Configure global preferences
- **Database Maintenance**: Backup and optimization
- **Security Monitoring**: Access logs and security alerts

### Business Configuration
- **Invoice Templates**: Customize invoice layouts and branding
- **VAT Settings**: Configure tax rates and handling
- **Payment Terms**: Set default payment conditions
- **Notifications**: Configure system alerts and reminders

### Analytics Dashboard
- **System Metrics**: Usage statistics and performance
- **Revenue Tracking**: Platform-wide financial metrics
- **User Activity**: Login patterns and feature usage
- **Growth Analytics**: User acquisition and retention

## 🔐 Security Features

### Data Protection
- **GDPR Compliant**: Full compliance with European data protection
- **Encryption**: All data encrypted in transit and at rest
- **Access Logs**: Complete audit trail of system access
- **Backup Systems**: Automated daily backups with retention

### User Security
- **Strong Authentication**: Password requirements and verification
- **Session Management**: Secure session handling
- **Role-Based Access**: Granular permission system
- **Two-Factor Authentication**: Optional 2FA for enhanced security

## 📱 Mobile & Responsive Design

### Cross-Platform Access
- **Responsive Design**: Optimized for all screen sizes
- **Mobile First**: Touch-friendly interface
- **Progressive Web App**: App-like experience on mobile
- **Offline Capability**: Basic functionality without internet

## 🌍 Multi-Language Support

### Supported Languages
- **Dutch (Nederlandse)**: Primary language for Dutch market
- **English**: International client communication
- **Turkish (Türkçe)**: Growing Turkish business community

### Localization Features
- **Currency Formatting**: EUR formatting for Dutch market
- **Date Formats**: European date formatting (DD/MM/YYYY)
- **Time Zones**: Amsterdam/Europe timezone handling
- **Cultural Adaptation**: Dutch business practices and conventions

## 🔧 Technical Features

### Performance
- **Fast Loading**: Optimized for speed and performance
- **Real-time Updates**: Live data synchronization
- **Caching**: Intelligent caching for better performance
- **CDN**: Global content delivery for fast access

### Integration Capabilities
- **Accounting Software**: Integration with popular Dutch accounting tools
- **Banking**: IBAN validation and payment processing
- **Email Systems**: Automated invoice delivery
- **Calendar Apps**: Time tracking integration

## 📞 Support & Help

### Getting Help
- **In-App Help**: Contextual help throughout the application
- **Knowledge Base**: Comprehensive documentation
- **Video Tutorials**: Step-by-step video guides
- **Email Support**: Direct support for technical issues

### Business Hours
- **Support Hours**: Monday-Friday, 9:00-17:00 CET
- **Response Time**: Within 24 hours for standard inquiries
- **Priority Support**: Available for critical issues
- **Dutch Language**: Support available in Dutch

## 🚀 Getting Started Checklist

### Initial Setup
1. ✅ Complete registration with all required information
2. ✅ Verify email address
3. ✅ Add first client to system
4. ✅ Create first project for client
5. ✅ Log first time entry
6. ✅ Submit time entry for approval
7. ✅ Generate first invoice
8. ✅ Configure payment settings

### Best Practices
- **Daily Time Tracking**: Log hours daily for accuracy
- **Detailed Descriptions**: Provide clear work descriptions
- **Regular Invoicing**: Generate invoices weekly/monthly
- **Client Communication**: Keep clients informed of progress
- **Data Backup**: Regular export of important data

## 💡 Tips for Success

### Time Management
- **Use Timer**: Built-in timer ensures accurate time tracking
- **15-Minute Blocks**: Track time in quarter-hour increments
- **Project Codes**: Use consistent project naming conventions
- **Daily Reviews**: Review and submit entries daily

### Client Relations
- **Clear Communication**: Detailed work descriptions
- **Regular Updates**: Weekly status reports
- **Professional Invoices**: Use branded invoice templates
- **Prompt Follow-up**: Monitor payment terms and follow up

### Financial Management
- **Monthly Reports**: Generate monthly financial reports
- **Track Metrics**: Monitor hourly rates and profitability
- **Plan Cash Flow**: Use reports for financial planning
- **Tax Preparation**: Export data for accounting/tax purposes

---

## Need More Help? 

Visit our [Knowledge Base](https://docs.proaspect.nl) or contact support at support@proaspect.nl

**ProAspect** - Making freelance administration simple and professional! 🚀