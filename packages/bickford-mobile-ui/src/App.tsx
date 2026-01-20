import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import UnifiedChatDock from './components/UnifiedChatDock';

export default function App() {
  const [nav, setNav] = React.useState(0);
  // Placeholder session data
  const sessions = [
    { id: 'sess_001', status: 'approved', user: 'alice', ttv: 3.2 },
    { id: 'sess_002', status: 'denied', user: 'bob', ttv: 7.1 },
    { id: 'sess_003', status: 'pending', user: 'carol', ttv: 0.0 },
  ];
  return (
    <>
      <Box sx={{ pb: 7, bgcolor: '#f7f7f7', minHeight: '100vh' }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Bickford Mobile UI
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm" sx={{ mt: 2, mb: 8 }}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Metrics (Demo)
            </Typography>
            <Typography variant="body2">DCR: 0.98</Typography>
            <Typography variant="body2">ΔTTV: -4.2 min</Typography>
            <Typography variant="body2">Rework Loops: 1</Typography>
          </Paper>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recent Sessions
            </Typography>
            <List>
              {sessions.map((s) => (
                <ListItem key={s.id} divider>
                  <ListItemText
                    primary={`Session: ${s.id}`}
                    secondary={`User: ${s.user} | Status: ${s.status} | TTV: ${s.ttv} min`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={nav}
            onChange={(_, newValue) => setNav(newValue)}
          >
            <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
            <BottomNavigationAction label="Sessions" icon={<ListAltIcon />} />
            <BottomNavigationAction label="Metrics" icon={<BarChartIcon />} />
          </BottomNavigation>
        </Paper>
      </Box>
      <UnifiedChatDock />
    </>
  );
}
