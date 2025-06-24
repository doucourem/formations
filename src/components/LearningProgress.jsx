import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const LearningProgress = ({ title = "React JS - Module 1", value = 65 }) => {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" gutterBottom>
        📈 Progression : {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress
            variant="determinate"
            value={value}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        <Typography variant="body2">{value}%</Typography>
      </Box>
    </Box>
  );
};

export default LearningProgress;
