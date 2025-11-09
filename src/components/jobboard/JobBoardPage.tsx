'use client'

import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Building,
  Search,
  FileText,
  Star,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// TODO: Remove hardcoded data and fetch from Firebase
// import { collection, query, getDocs } from "firebase/firestore";
// import { db } from '../../lib/firebase';

const JobBoardPage: React.FC = () => {
  const jobListings = [
    {
      id: "job1",
      title: "Software Engineer Intern",
      company: "TechCorp",
      location: "San Francisco, CA",
      type: "Internship",
      postedDate: "2025-10-22",
      tags: ["JavaScript", "React", "Node.js"],
    },
    {
      id: "job2",
      title: "Junior Product Analyst",
      company: "Innovate Inc.",
      location: "New York, NY",
      type: "Full-time",
      postedDate: "2025-10-20",
      tags: ["SQL", "Tableau", "Data Analysis"],
    },
    {
      id: "job3",
      title: "Marketing Associate",
      company: "Connectify",
      location: "Remote",
      type: "Part-time",
      postedDate: "2025-10-18",
      tags: ["Social Media", "SEO", "Content Creation"],
    },
  ];

  const featuredCompanies = [
    {
      name: "TechCorp",
      logo: "🏢"
    },
    {
      name: "Innovate Inc.",
      logo: "💡"
    },
    {
      name: "Connectify",
      logo: "🌐"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold mt-3">Job Board</h1>
        <p className="text-muted-foreground mt-1">
          Discover exclusive job and internship opportunities from our alumni
          network.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by title, company, or keyword..."
              className="pl-10"
            />
          </div>
          <Button>Search</Button>
          <Button variant="outline">Filters</Button>
        </CardContent>
      </Card>

      {/* Hardcoded Data Section */}
      <div className="border-2 border-red-500 border-dashed rounded-xl p-4">
        <p className="text-red-500 text-sm font-semibold mb-4 text-center">
          Developer Note: The data below is hardcoded. This section should be
          replaced with live data from Firebase.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Job Listings */}
          <div className="lg:col-span-2 space-y-4">
            {jobListings.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between flex-wrap">
                      <span className="text-xl">{job.title}</span>
                      <Badge>{job.type}</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-muted-foreground">
                        Posted on{" "}
                        {new Date(job.postedDate).toLocaleDateString()}
                      </p>
                      <Button>Apply Now</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Stats and Featured Companies */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Applications Sent
                  </span>
                  <span className="font-bold text-lg">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Interviews</span>
                  <span className="font-bold text-lg">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Offers</span>
                  <span className="font-bold text-lg">1</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
.                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Featured Companies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featuredCompanies.map((company) => (
                  <div
                    key={company.name}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                  >
                    <span className="text-2xl">{company.logo}</span>
                    <span className="font-semibold">{company.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JobBoardPage;

