import React from 'react';
import { Button, Container, Typography, Box, Grid, Card, CardContent, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  PhotoCamera,
  Map,
  Assignment,
  Notifications,
  Speed,
  Visibility,
  Group,
  LocationOn,
  CloudUpload,
  Build,
  CheckCircle
} from '@mui/icons-material';

const Homepage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <PhotoCamera />,
      title: "Real-time Reporting",
      description: "Capture issues with photos and GPS location for precise reporting"
    },
    {
      icon: <Map />,
      title: "Interactive Map",
      description: "View all civic issues on a live map with real-time status updates"
    },
    {
      icon: <Assignment />,
      title: "Smart Routing",
      description: "Automated routing to the appropriate municipal department"
    },
    {
      icon: <Notifications />,
      title: "Progress Tracking",
      description: "Get notifications on issue status and resolution updates"
    }
  ];

  const steps = [
    {
      icon: <LocationOn />,
      title: "Capture Issue",
      description: "Take a photo and add location details of the civic issue"
    },
    {
      icon: <CloudUpload />,
      title: "Submit Report",
      description: "Upload via our mobile-friendly platform with one click"
    },
    {
      icon: <Build />,
      title: "Municipality Acts",
      description: "Issue gets routed to the right department for resolution"
    },
    {
      icon: <CheckCircle />,
      title: "Get Notified",
      description: "Receive updates when your issue is resolved"
    }
  ];

  const benefits = [
    {
      icon: <Speed />,
      title: "Faster Response Times",
      description: "Issues get resolved 60% faster with direct routing"
    },
    {
      icon: <Visibility />,
      title: "Greater Transparency",
      description: "Track every step of the resolution process"
    },
    {
      icon: <Group />,
      title: "Engaged Communities",
      description: "Citizens actively participate in improving their neighborhoods"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-green-600 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <Container maxWidth="lg" className="relative">
          <div className="py-20 px-4 text-center">
            <Typography variant="h2" component="h1" className="font-bold mb-6 text-4xl md:text-6xl">
              Empowering Citizens,<br />
              <span className="text-yellow-300">Strengthening Communities</span>
            </Typography>
            <Typography variant="h5" className="mb-8 text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Report civic issues in real-time and track their resolution. 
              Together, we can make our communities better.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/citizen-portal')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                sx={{ 
                  backgroundColor: '#FF9933',
                  '&:hover': { backgroundColor: '#e6842d' },
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                🏛️ Report an Issue
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200"
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { backgroundColor: 'white', color: '#1976d2' },
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container maxWidth="lg" className="py-16">
        <div className="text-center mb-12">
          <Typography variant="h3" component="h2" className="font-bold mb-4 text-gray-800">
            Platform Features
          </Typography>
          <Typography variant="h6" className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to report, track, and resolve civic issues efficiently
          </Typography>
        </div>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-0">
                <CardContent className="text-center p-6">
                  <Avatar 
                    className="mx-auto mb-4 w-16 h-16"
                    sx={{ 
                      bgcolor: '#FF9933', 
                      width: 64, 
                      height: 64,
                      fontSize: '2rem'
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" className="font-semibold mb-2 text-gray-800">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <Container maxWidth="lg">
          <div className="text-center mb-12">
            <Typography variant="h3" component="h2" className="font-bold mb-4 text-gray-800">
              How It Works
            </Typography>
            <Typography variant="h6" className="text-gray-600">
              Simple steps to report and resolve civic issues
            </Typography>
          </div>
          
          <Grid container spacing={6} alignItems="center">
            {steps.map((step, index) => (
              <Grid item xs={12} md={3} key={index}>
                <div className="text-center">
                  <div className="relative">
                    <Avatar 
                      className="mx-auto mb-4 w-20 h-20"
                      sx={{ 
                        bgcolor: index % 2 === 0 ? '#138808' : '#000080',
                        width: 80, 
                        height: 80,
                        fontSize: '2.5rem'
                      }}
                    >
                      {step.icon}
                    </Avatar>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-300 transform -translate-y-0.5"></div>
                    )}
                  </div>
                  <Typography variant="h6" className="font-semibold mb-2 text-gray-800">
                    Step {index + 1}: {step.title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {step.description}
                  </Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Impact Section */}
      <Container maxWidth="lg" className="py-16">
        <div className="text-center mb-12">
          <Typography variant="h3" component="h2" className="font-bold mb-4 text-gray-800">
            Community Impact
          </Typography>
          <Typography variant="h6" className="text-gray-600">
            Making a real difference in communities across India
          </Typography>
        </div>
        
        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <div className="text-center p-6">
                <Avatar 
                  className="mx-auto mb-4 w-16 h-16"
                  sx={{ 
                    bgcolor: '#000080', 
                    width: 64, 
                    height: 64,
                    fontSize: '2rem'
                  }}
                >
                  {benefit.icon}
                </Avatar>
                <Typography variant="h5" className="font-semibold mb-3 text-gray-800">
                  {benefit.title}
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  {benefit.description}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white py-16">
        <Container maxWidth="lg">
          <div className="text-center">
            <Typography variant="h3" component="h2" className="font-bold mb-4">
              Ready to Make a Difference?
            </Typography>
            <Typography variant="h6" className="mb-8 opacity-90">
              Join thousands of citizens already using our platform
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/citizen-portal')}
                sx={{ 
                  backgroundColor: 'white',
                  color: '#FF9933',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                Start Reporting Issues
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Admin Login
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" className="font-bold mb-4">
                🏛️ SevaTrack
              </Typography>
              <Typography variant="body2" className="text-gray-300">
                Empowering citizens and strengthening communities through 
                technology-driven civic engagement.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" className="font-semibold mb-4">
                Quick Links
              </Typography>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/about')}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  About
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </button>
                <button 
                  onClick={() => navigate('/privacy')}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </div>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" className="font-semibold mb-4">
                Contact Info
              </Typography>
              <Typography variant="body2" className="text-gray-300">
                📧 support@civicconnect.gov.in<br />
                📞 1800-123-CIVIC<br />
                🌐 Smart India Hackathon Project
              </Typography>
            </Grid>
          </Grid>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <Typography variant="body2" className="text-gray-400">
              © 2025 Civic Engagement Platform. All rights reserved.
            </Typography>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Homepage;
