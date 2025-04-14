import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Chat from './Chat';
import ChatList from './ChatList';
import { Box, Grid, Paper } from '@mui/material';

const Messages = ({ initialUserId }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (initialUserId) {
      setSelectedChat(initialUserId);
    }
  }, [initialUserId]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ height: '80vh', overflow: 'auto' }}>
          <ChatList
            currentUser={currentUser}
            onSelectChat={setSelectedChat}
            selectedChat={selectedChat}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ height: '80vh' }}>
          {selectedChat ? (
            <Chat
              currentUser={currentUser}
              recipientId={selectedChat}
            />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              Select a conversation to start messaging
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Messages; 