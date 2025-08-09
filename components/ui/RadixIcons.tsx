import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mapeo de iconos Radix a MaterialCommunityIcons
export const RadixIcons = {
  // Navigation
  Home: (props: any) => <Icon name="home" {...props} />,
  Dashboard: (props: any) => <Icon name="view-dashboard" {...props} />,
  Users: (props: any) => <Icon name="account-group" {...props} />,
  User: (props: any) => <Icon name="account" {...props} />,
  Settings: (props: any) => <Icon name="cog" {...props} />,
  Bell: (props: any) => <Icon name="bell" {...props} />,
  Search: (props: any) => <Icon name="magnify" {...props} />,
  Menu: (props: any) => <Icon name="menu" {...props} />,
  Close: (props: any) => <Icon name="close" {...props} />,
  
  // Actions
  Plus: (props: any) => <Icon name="plus" {...props} />,
  Edit: (props: any) => <Icon name="pencil" {...props} />,
  Delete: (props: any) => <Icon name="delete" {...props} />,
  Save: (props: any) => <Icon name="content-save" {...props} />,
  Download: (props: any) => <Icon name="download" {...props} />,
  Upload: (props: any) => <Icon name="upload" {...props} />,
  
  // Status
  Check: (props: any) => <Icon name="check" {...props} />,
  Alert: (props: any) => <Icon name="alert" {...props} />,
  Info: (props: any) => <Icon name="information" {...props} />,
  Warning: (props: any) => <Icon name="alert-circle" {...props} />,
  Error: (props: any) => <Icon name="close-circle" {...props} />,
  Success: (props: any) => <Icon name="check-circle" {...props} />,
  AlertCircle: (props: any) => <Icon name="alert-circle" {...props} />,
  
  // Communication
  Mail: (props: any) => <Icon name="email" {...props} />,
  Phone: (props: any) => <Icon name="phone" {...props} />,
  Message: (props: any) => <Icon name="message" {...props} />,
  
  // Data
  File: (props: any) => <Icon name="file" {...props} />,
  Folder: (props: any) => <Icon name="folder" {...props} />,
  Database: (props: any) => <Icon name="database" {...props} />,
  Chart: (props: any) => <Icon name="chart-line" {...props} />,
  FileText: (props: any) => <Icon name="file-document" {...props} />,
  Documents: (props: any) => <Icon name="file-document" {...props} />,
  Document: (props: any) => <Icon name="file-document" {...props} />,
  
  // UI
  ChevronDown: (props: any) => <Icon name="chevron-down" {...props} />,
  ChevronUp: (props: any) => <Icon name="chevron-up" {...props} />,
  ChevronLeft: (props: any) => <Icon name="chevron-left" {...props} />,
  ChevronRight: (props: any) => <Icon name="chevron-right" {...props} />,
  ArrowRight: (props: any) => <Icon name="arrow-right" {...props} />,
  ArrowLeft: (props: any) => <Icon name="arrow-left" {...props} />,
  
  // Theme
  Sun: (props: any) => <Icon name="white-balance-sunny" {...props} />,
  Moon: (props: any) => <Icon name="moon-waning-crescent" {...props} />,
  
  // Auth
  Logout: (props: any) => <Icon name="logout" {...props} />,
  Login: (props: any) => <Icon name="login" {...props} />,
  Lock: (props: any) => <Icon name="lock" {...props} />,
  Eye: (props: any) => <Icon name="eye" {...props} />,
  EyeOff: (props: any) => <Icon name="eye-off" {...props} />,
  
  // Business
  Calendar: (props: any) => <Icon name="calendar" {...props} />,
  Clock: (props: any) => <Icon name="clock" {...props} />,
  Location: (props: any) => <Icon name="map-marker" {...props} />,
  Building: (props: any) => <Icon name="office-building" {...props} />,
  
  // Education
  School: (props: any) => <Icon name="school" {...props} />,
  Book: (props: any) => <Icon name="book" {...props} />,
  Graduation: (props: any) => <Icon name="school" {...props} />,
  Students: (props: any) => <Icon name="account-multiple" {...props} />,
  
  // Notifications
  Notification: (props: any) => <Icon name="bell-ring" {...props} />,
  NotificationOff: (props: any) => <Icon name="bell-off" {...props} />,
  
  // Profile
  Avatar: (props: any) => <Icon name="account-circle" {...props} />,
  Profile: (props: any) => <Icon name="account" {...props} />,
  
  // Media
  Image: (props: any) => <Icon name="image" {...props} />,
  Video: (props: any) => <Icon name="video" {...props} />,
  Camera: (props: any) => <Icon name="camera" {...props} />,
  
  // Social
  Heart: (props: any) => <Icon name="heart" {...props} />,
  Share: (props: any) => <Icon name="share" {...props} />,
  Like: (props: any) => <Icon name="thumb-up" {...props} />,
  
  // System
  Refresh: (props: any) => <Icon name="refresh" {...props} />,
  Loading: (props: any) => <Icon name="loading" {...props} />,
  Sync: (props: any) => <Icon name="sync" {...props} />,
  
  // Custom for your app
  CRM: (props: any) => <Icon name="account-multiple" {...props} />,
  Teachers: (props: any) => <Icon name="account-tie" {...props} />,
  
  // Search and Account icons
  Account: (props: any) => <Icon name="account" {...props} />,
  AccountCog: (props: any) => <Icon name="account-cog" {...props} />,
  ClipboardList: (props: any) => <Icon name="clipboard-list" {...props} />,
  
  // Additional icons for search results
  AccountMultiple: (props: any) => <Icon name="account-multiple" {...props} />,
  AccountTie: (props: any) => <Icon name="account-tie" {...props} />,
  FileDocument: (props: any) => <Icon name="file-document" {...props} />,
  ClipboardText: (props: any) => <Icon name="clipboard-text" {...props} />,
};

export default RadixIcons; 