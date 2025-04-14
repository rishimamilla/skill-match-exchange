import React from 'react';
import { useParams } from 'react-router-dom';
import Messages from '../components/Messages';
import { Box, Typography } from '@mui/material';

const MessagesPage = () => {
  const { userId } = useParams();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Messages
      </Typography>
      <Messages initialUserId={userId} />
    </Box>
  );
};

export default MessagesPage; 