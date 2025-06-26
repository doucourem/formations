import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// import axios from 'axios'; // à décommenter si tu récupères les events via API

export default function Agenda() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    /*
    axios.get("http://localhost:8000/api/events/")
      .then((res) => {
        const formatted = res.data.map(ev => ({
          id: ev.id,
          title: ev.title,
          start: ev.start,
          end: ev.end,
          allDay: ev.all_day
        }));
    
        setEvents(formatted);
      });
    */
  }, []);

  return (
    <div>
      <h2>Agenda</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        buttonText={{
          today: "Aujourd'hui",
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          list: 'Liste'
        }}
        events={events}
        height="auto"
        locale="fr"
      />
    </div>
  );
}
