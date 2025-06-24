import React from 'react';
import CourseCard from '../components/CourseCard';
import courses from '../data/courses';
export default function CourseCard2() {
 

    
  return (
    <div>
      <h1>Liste des Cours</h1>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );



}
