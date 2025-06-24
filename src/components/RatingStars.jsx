import React, { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import { Box, Typography } from '@mui/material';

const RatingStars = ({ max = 5, initialRating = 0, onRate }) => {
  const [rating, setRating] = useState(initialRating);

  const handleClick = (index) => {
    setRating(index);
    if (onRate) onRate(index);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {[...Array(max)].map((_, i) => {
        const index = i + 1;
        return (
          <StarIcon
            key={index}
            onClick={() => handleClick(index)}
            sx={{
              cursor: 'pointer',
              color: index <= rating ? '#ffb400' : '#ccc',
              fontSize: 30,
              transition: 'color 0.2s',
              '&:hover': { color: '#ffa726' },
            }}
            aria-label={`${index} étoile${index > 1 ? 's' : ''}`}
          />
        );
      })}
      <Typography variant="body2" sx={{ ml: 1 }}>
        {rating} / {max}
      </Typography>
    </Box>
  );
};

export default RatingStars;
