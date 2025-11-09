'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

// TODO: Remove hardcoded data and fetch from Firebase
// import { collection, query, getDocs } from "firebase/firestore";
// import { db } from '../../lib/firebase';

const EventsPage: React.FC = () => {
  const upcomingEvents = [
    {
      id: 'evt1',
      title: 'Alumni Networking Night',
      date: '2025-11-15',
      time: '6:00 PM - 8:00 PM',
      location: 'University Grand Hall',
      type: 'Networking',
      image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&h=400&fit=crop',
    },
    {
      id: 'evt2',
      title: 'Tech Talk: The Future of AI',
      date: '2025-11-22',
      time: '4:00 PM - 5:30 PM',
      location: 'Online Webinar',
      type: 'Webinar',
      image: 'https://images.unsplash.com/photo-1620712943543-95fc69634367?w=800&h=400&fit=crop',
    },
  ];

  const pastEvents = [
    {
      id: 'evt3',
      title: 'Career Fair 2024',
      date: '2025-10-05',
      location: 'Campus Gymnasium',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold mt-3">Events</h1>
        <p className="text-muted-foreground mt-1">
          Connect with alumni and grow your network at our exclusive events.
        </p>
      </div>

      {/* Hardcoded Data Section */}
      <div className="border-2 border-red-500 border-dashed rounded-xl p-4">
        <p className="text-red-500 text-sm font-semibold mb-4 text-center">
          Developer Note: The data below is hardcoded. This section should be replaced with live data from Firebase.
        </p>

        {/* Upcoming Events */}
        <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <Badge variant="secondary" className="w-fit">{event.type}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <Button className="w-full mt-2">Register Now</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Past Events */}
        <h2 className="text-2xl font-bold mt-12 mb-4">Past Events</h2>
        <div className="space-y-4">
          {pastEvents.map(event => (
            <Card key={event.id} className="p-4 flex items-center justify-between flex-wrap">
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <Button variant="outline">View Details</Button>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EventsPage;
