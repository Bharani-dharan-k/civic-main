import React, { useState, useEffect } from 'react';
import { Box, Badge, IconButton, Menu, MenuItem, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip, Button, Divider } from '@mui/material';
import { Notifications, Assignment, Update, CheckCircle, Warning, Info, Clear } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext.jsx';

const NotificationSystem = () => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const notifications = [
        { id: 1, type: 'assignment', title: 'New Task', message: 'Fix pothole on Main St', read: false, priority: 'high', timestamp: new Date() },
      ];
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment': return <Assignment />;
      case 'update': return <Update />;
      case 'completed': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <Notifications />;
    }
  };

  if (!user) return null;

  return (
    <>
      <IconButton color="inherit" onClick={(e)=>setAnchorEl(e.currentTarget)} sx={{ mr: 1 }}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Notifications />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={()=>setAnchorEl(null)}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications ({unreadCount})</Typography>
        </Box>
        <List sx={{ py: 0, maxHeight: 300, overflow: 'auto' }}>
          {notifications.map((n, i) => (
            <React.Fragment key={n.id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>{getNotificationIcon(n.type)}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={n.title} secondary={n.message} />
              </ListItem>
              {i < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ p: 1 }}>
          <Button size="small" fullWidth>View All</Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationSystem;
