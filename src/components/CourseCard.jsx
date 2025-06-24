import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CardMedia,
  Button,
} from "@mui/material";

const CourseCard = ({ course, onLearnMore }) => {
  return (
    <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 3 }}>
      {/* Image en haut */}
      {course.image && (
        <CardMedia
          component="img"
          height="160"
          image={course.image}
          alt={course.titre}
          sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        />
      )}

      <CardContent>
        <Typography variant="h6" gutterBottom>
          {course.titre}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {course.description}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <Typography variant="body2">
            <strong>Niveau :</strong> {course.niveau}
          </Typography>
          <Typography variant="body2">
            <strong>Durée :</strong> {course.duree}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          onClick={() => onLearnMore?.(course)}
          aria-label={`En savoir plus sur ${course.titre}`}
        >
          En savoir plus
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
