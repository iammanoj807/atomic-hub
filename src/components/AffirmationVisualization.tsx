import React, { useState } from 'react';
import { Dialog, Box, Typography, IconButton, Tooltip } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ArchitectureRoundedIcon from '@mui/icons-material/ArchitectureRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import { useTaskContext } from '../context/TaskContext';
import { VIZ_LEFT_PANEL_GRADIENT, ROLE_COLORS, MISSION_STATEMENT } from '../data/missionTypes';

interface AffirmationVisualizationProps {
  open: boolean;
  onClose: () => void;
}

const vizSteps = [
  { title: "BREATHE FIRST", content: (<>I close my eyes.<br /><br />In for 4 counts.<br />Hold for 4.<br />Out for 4.<br />Twice.<br /><br />My mind is still.<br />I am not rushing. I am arriving.</>) },
  { title: "I ENTER SAN FRANCISCO", content: (<>It is 8:30 in the morning.<br /><br />The air is on my face — cool, crisp, slightly salty. The Bay Area fog is still lifting. It is clean. Alive.<br /><br />I am walking. My shoes meet the pavement with purpose.<br /><br />A cable car sounds in the distance.<br />A coffee shop door opens nearby — the smell of espresso drifts out.<br />Morning traffic hums low around me.<br /><br />I look up.<br /><br />The sky is breaking blue through the last fog.<br /><br />And there — in the distance — <strong>THE GOLDEN GATE BRIDGE.</strong><br /><br />The deep red towers rising above the bay.<br />The cables sweeping down in perfect arcs.<br />The water below — silver, still, enormous.<br /><br />I look at it. I really look at it.<br />I feel what it means to see it.<br /><br />I live in this city.<br />I earned my place here.</>) },
  { title: "I DRIVE TO SILICON VALLEY", content: (<>I am on Highway 101 South.<br /><br />The bay stretches to my left — silver and gold in the morning light.<br /><br />I pass the signs:<br />→ Palo Alto<br />→ Menlo Park<br />→ Mountain View<br />→ Cupertino<br /><br />Names I used to only read about online. Now they are my commute.<br /><br />I feel the seat beneath me.<br />Coffee in my hand — warm, solid.<br />I smell it. I take a sip.<br /><br />I am not a visitor.<br />I am not a dreamer looking in from outside.<br />I am going to work.<br />This is my life.</>) },
  { title: "I ARRIVE AT THE OFFICE", content: (<>The campus opens in front of me.<br /><br />Wide green grass — warm in the morning sun.<br />Glass buildings reflecting the California sky.<br />I smell the fresh cut grass.<br />I hear quiet conversations, footsteps, the low sound of a fountain nearby.<br /><br />People move around me with quiet energy — engineers, designers, builders.<br /><br />Someone nods at me as I walk in.<br />I nod back. I belong here.<br /><br />I badge in.<br />I feel the slight push of the door — it opens.<br /><br />I am inside.</>) },
  { title: "THE WORK MOMENT", content: (<>I sit at my desk. Two monitors. Clean setup.<br />My hands rest on the keyboard.<br />I feel the coolness of the keys.<br />My coffee is next to me.<br /><br />There is a real problem on my screen.<br />Code. A system to design.<br /><br />I look at it — and something in me settles.<br /><br />I understand this.<br />I am good at this.<br /><br />My colleague leans over:<br /><em>"Hey — what do you think about this?"</em><br /><br />I think for a moment. Then I explain.<br />Clearly. Confidently. No hesitation.<br /><br />They listen. They nod.<br /><em>"Yeah. That makes sense."</em><br /><br />I feel that land in my chest.<br />The quiet satisfaction of being respected for my mind.<br /><br />That is not luck. That is me.<br />That is what I built.<br /><br />Around me — the low energy of focused people doing meaningful work.<br />I am one of them.<br />I belong here.</>) },
  { title: "THE FAMILY CALL", content: (<>It is evening. The California sun is golden.<br />The bay shimmers in the last light outside my window.<br /><br />I pick up my phone.<br />I call home.<br /><br />My mother answers.<br /><br />I hear her voice — really hear it.<br />That specific voice. No one in the world sounds like her.<br /><br />I say:<br /><em>"Ama, I am doing well. Really well."</em><br /><br />I hear what she says back.<br />I hear her laugh. Her relief. Her pride.<br /><br />My father is somewhere in the background.<br />He doesn't say much. He never has to.<br /><br />But I feel it —<br />that deep, quiet pride a father carries when his child has made it.<br /><br />I feel it in my chest.<br />I stay with it.<br />I hold it there.<br /><br /><Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', my: 2 }} /><em>One slow breath. I open my eyes.</em></>) },
];

const roles = [
  { title: "ENGINEER", icon: <CodeRoundedIcon sx={{ fontSize: 36, color: ROLE_COLORS.ENGINEER }} />, content: (<>I build real skills every single day.<br /><br />I solve hard problems with clarity and calm.<br /><br />I land a role in the United States that reflects<br />my talent and opens the Silicon Valley door.</>) },
  { title: "SON", icon: <FavoriteRoundedIcon sx={{ fontSize: 36, color: ROLE_COLORS.SON }} />, content: (<>My parents gave everything so I could be here.<br /><br />I honour that by making something real of it.<br /><br />I call home. I stay present. I make them proud —<br />not just when I arrive, but in how I live right now.</>) },
  { title: "SCHOLAR", icon: <SchoolRoundedIcon sx={{ fontSize: 36, color: ROLE_COLORS.SCHOLAR }} />, content: (<>I finish my MSc with full effort and integrity.<br /><br />I never stop learning — AI, systems, problems that matter.<br /><br />I am always the person in the room who prepared.</>) },
  { title: "BUILDER", icon: <ArchitectureRoundedIcon sx={{ fontSize: 36, color: ROLE_COLORS.BUILDER }} />, content: (<>I am building a life — not just a career.<br /><br />I build discipline, character, and good habits daily.<br /><br />I build the kind of person who deserves that life<br />in America — before I arrive.</>) },
  { title: "MAN OF CHARACTER", icon: <ShieldRoundedIcon sx={{ fontSize: 36, color: ROLE_COLORS.CHARACTER }} />, content: (<>I do what I say I will do.<br /><br />I am honest with myself about where I am<br />and where I need to go.<br /><br />I do not wait for motivation — I move on discipline.</>) },
];

type LayerType = 'visualization' | 'mission' | 'filter';

const AffirmationVisualization: React.FC<AffirmationVisualizationProps> = ({ open, onClose }) => {
  const { isMuted, setIsMuted } = useTaskContext();
  const [layer, setLayer] = useState<LayerType>('visualization');
  const [roleIndex, setRoleIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
    }
  }, [open]);

  const switchLayer = (l: LayerType) => {
    setFadeIn(false);
    setTimeout(() => { setLayer(l); setRoleIndex(0); setFadeIn(true); }, 300);
  };

  const navRole = (dir: 'prev' | 'next') => {
    setFadeIn(false);
    setTimeout(() => {
      setRoleIndex(p => dir === 'next' ? Math.min(p + 1, roles.length - 1) : Math.max(p - 1, 0));
      setFadeIn(true);
    }, 250);
  };

  const handleClose = () => { setLayer('visualization'); setRoleIndex(0); setFadeIn(true); onClose(); };

  const tabSx = (active: boolean) => ({
    cursor: 'pointer', py: 1.2, px: 2.5,
    borderBottom: '2px solid', borderColor: active ? 'primary.main' : 'transparent',
    transition: 'all 0.3s ease',
    '&:hover': { borderColor: active ? 'primary.main' : 'rgba(255,255,255,0.2)' },
  });
  const tabTextSx = (active: boolean) => ({
    color: active ? '#fff' : 'rgba(255,255,255,0.4)',
    fontWeight: active ? 700 : 400,
    letterSpacing: 1.5, textTransform: 'uppercase' as const, fontSize: '0.75rem',
    transition: 'all 0.3s ease',
  });

  return (
    <Dialog fullScreen open={open} onClose={handleClose} PaperProps={{ sx: { backgroundColor: '#000', overflow: 'hidden' } }}>
      {/* Video Background */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden', backgroundColor: '#000' }}>
        <video ref={videoRef} autoPlay preload="auto" loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'slowZoom 40s linear infinite alternate' }}>
          <source src="https://res.cloudinary.com/dvnorrdas/video/upload/v1778399638/Golden_Gate_Video_gjgwbh.mp4" type="video/mp4" />
        </video>
        <style>{`@keyframes slowZoom { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }`}</style>
      </Box>

      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'flex-start', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
        {/* Mute */}
        <Tooltip title={isMuted ? "Unmute" : "Mute"}>
          <IconButton aria-label={isMuted ? 'Unmute' : 'Mute'} size="small" onClick={() => setIsMuted(!isMuted)} disableRipple sx={{ position: 'absolute', top: { xs: 16, md: 24 }, right: { xs: 16, md: 24 }, color: 'rgba(255,255,255,0.7)', outline: 'none !important', zIndex: 10, '&:focus': { outline: 'none' }, '&:hover': { bgcolor: 'transparent', transform: 'scale(1.1)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 20, p: 0.5 }}>
              {[0.3, 0.5, 0.2, 0.7, 0.4].map((d, i) => (<Box key={i} sx={{ width: 3, borderRadius: '2px', bgcolor: isMuted ? 'text.disabled' : 'primary.main', animation: `ab${i} ${0.8 + d}s ease-in-out infinite`, animationPlayState: isMuted ? 'paused' : 'running', height: isMuted ? '4px' : undefined }} />))}
            </Box>
          </IconButton>
        </Tooltip>

        {/* Left panel */}
        <Box sx={{ width: { xs: '100%', md: '60%', lg: '50%' }, height: '100vh', background: VIZ_LEFT_PANEL_GRADIENT, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', p: { xs: 3, md: 4 }, pb: 2, flexShrink: 0, gap: 2 }}>
            <IconButton aria-label="Close" onClick={handleClose} disableRipple sx={{ color: 'rgba(255,255,255,0.7)', outline: 'none !important', '&:focus': { outline: 'none' }, '&.MuiButtonBase-root': { outline: 'none' }, '&:hover': { color: 'white', bgcolor: 'transparent', transform: 'scale(1.05)' }, transition: 'all 0.2s ease' }}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 3, fontSize: '0.8rem', flexGrow: 1 }}>
              Routine
            </Typography>
          </Box>
          <style>{`
            @keyframes ab0 { 0%, 100% { height: 4px; } 50% { height: 16px; } }
            @keyframes ab1 { 0%, 100% { height: 8px; } 50% { height: 20px; } }
            @keyframes ab2 { 0%, 100% { height: 6px; } 50% { height: 12px; } }
            @keyframes ab3 { 0%, 100% { height: 10px; } 50% { height: 18px; } }
            @keyframes ab4 { 0%, 100% { height: 5px; } 50% { height: 14px; } }
          `}</style>

          {/* Tabs */}
          <Box sx={{ display: 'flex', gap: 0, px: { xs: 4, md: 6 }, mb: 1 }}>
            <Box onClick={() => switchLayer('visualization')} sx={tabSx(layer === 'visualization')}><Typography variant="body2" sx={tabTextSx(layer === 'visualization')}>Visualization</Typography></Box>
            <Box onClick={() => switchLayer('mission')} sx={tabSx(layer === 'mission')}><Typography variant="body2" sx={tabTextSx(layer === 'mission')}>Mission & Roles</Typography></Box>
            <Box onClick={() => switchLayer('filter')} sx={tabSx(layer === 'filter')}><Typography variant="body2" sx={tabTextSx(layer === 'filter')}>Daily Filter</Typography></Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: { xs: 4, md: 6 }, pt: { xs: 2, md: 3 }, overflowY: 'auto', flexGrow: 1, msOverflowStyle: 'none', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>

            {/* LAYER 1: Visualization */}
            {layer === 'visualization' && (
              <Box sx={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2.5 }}>
                  <Typography variant="h3" fontWeight="800" sx={{ color: '#fff', letterSpacing: -1 }}>Daily Affirmation</Typography>
                  <Box component="img" src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" alt="USA Flag" sx={{ height: 32, borderRadius: '4px', boxShadow: '0 4px 14px rgba(0,0,0,0.5)', opacity: 0.95 }} />
                </Box>
                <Box sx={{ mb: 6, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: '3px', background: 'linear-gradient(to bottom, #4a90e2, transparent)', borderRadius: 2 }} />
                  <Typography variant="h6" sx={{ pl: 4, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.8, color: 'rgba(255,255,255,0.95)', fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                    I am a successful software engineer building my life in the United States of America. I work with great people, solve meaningful problems, and grow every day. I attract companies that value my talent and open the right doors for me. I enjoy my new life in America with gratitude, confidence, and purpose.
                  </Typography>
                </Box>
                <Box sx={{ pb: 2 }} />
                {vizSteps.map((step, i) => (
                  <Box key={i} sx={{ mb: 6, opacity: 0.95, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 } }}>
                    <Typography variant="h6" fontWeight="700" letterSpacing={1.5} sx={{ color: '#fff', textTransform: 'uppercase', fontSize: { xs: '1.35rem', md: '1.5rem' }, mb: 2, display: 'inline-block', pb: 1.5, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, width: '60px', height: '3px', background: 'linear-gradient(to right, #4a90e2, transparent)', borderRadius: 2 } }}>{step.title}</Typography>
                    <Box sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: 1.8, fontWeight: 300 }}>{step.content}</Box>
                  </Box>
                ))}
                <Box sx={{ pb: 12 }} />
              </Box>
            )}

            {/* LAYER 2: Mission & Roles */}
            {layer === 'mission' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)', justifyContent: 'center' }}>
                {/* "Mission" heading with icon — same style as "Daily Affirmation" */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2.5 }}>
                  <Typography variant="h3" fontWeight="800" sx={{ color: '#fff', letterSpacing: -1 }}>Mission</Typography>
                  <RocketLaunchRoundedIcon sx={{ fontSize: 32, color: '#4a90e2', opacity: 0.95 }} />
                </Box>

                {/* Mission statement quote */}
                <Box sx={{ mb: 6, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: '3px', background: 'linear-gradient(to bottom, #4a90e2, transparent)', borderRadius: 2 }} />
                  <Typography variant="h6" sx={{ pl: 4, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.8, color: 'rgba(255,255,255,0.95)', fontSize: { xs: '1.1rem', md: '1.3rem' }, whiteSpace: 'pre-wrap' }}>
                    {MISSION_STATEMENT}
                  </Typography>
                </Box>

                <Box sx={{ pb: 2 }} />

                {/* Current Role — styled like visualization steps (BREATHE FIRST) */}
                <Box key={roleIndex} sx={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', mb: 4 }}>
                  {/* "TO FULFIL THIS MISSION — MY ROLES" label just above role */}
                  <Typography variant="overline" sx={{ color: '#fff', letterSpacing: 3, fontSize: '0.85rem', display: 'block', mb: 2, fontWeight: 600 }}>
                    TO FULFIL THIS MISSION — MY ROLES
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    {roles[roleIndex].icon}
                    <Typography variant="h6" fontWeight="700" letterSpacing={1.5} sx={{ color: '#fff', textTransform: 'uppercase', fontSize: { xs: '1.35rem', md: '1.5rem' }, display: 'inline-block', pb: 1.5, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, width: '60px', height: '3px', background: 'linear-gradient(to right, #4a90e2, transparent)', borderRadius: 2 } }}>
                      {roles[roleIndex].title}
                    </Typography>
                  </Box>
                  <Box sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: 1.8, fontWeight: 300 }}>
                    {roles[roleIndex].content}
                  </Box>
                </Box>

                {/* Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 4 }}>
                  <IconButton aria-label="Previous role" onClick={() => navRole('prev')} disabled={roleIndex === 0} disableRipple sx={{ color: roleIndex === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)', border: '1px solid', borderColor: roleIndex === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)', outline: 'none !important', '&:focus': { outline: 'none' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }, transition: 'all 0.2s ease' }}>
                    <ArrowBackRoundedIcon fontSize="small" />
                  </IconButton>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {roles.map((_, i) => (
                      <Box key={i} onClick={() => { setFadeIn(false); setTimeout(() => { setRoleIndex(i); setFadeIn(true); }, 250); }} sx={{ width: i === roleIndex ? 24 : 8, height: 8, borderRadius: 4, bgcolor: i === roleIndex ? 'primary.main' : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { bgcolor: i === roleIndex ? 'primary.main' : 'rgba(255,255,255,0.4)' } }} />
                    ))}
                  </Box>
                  <IconButton aria-label="Next role" onClick={() => navRole('next')} disabled={roleIndex === roles.length - 1} disableRipple sx={{ color: roleIndex === roles.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)', border: '1px solid', borderColor: roleIndex === roles.length - 1 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)', outline: 'none !important', '&:focus': { outline: 'none' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }, transition: 'all 0.2s ease' }}>
                    <ArrowForwardRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', mt: 2, fontSize: '0.8rem', letterSpacing: 2 }}>{roleIndex + 1} / {roles.length}</Typography>
              </Box>
            )}

            {/* LAYER 3: Daily Filter */}
            {layer === 'filter' && (
              <Box sx={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2.5 }}>
                  <Typography variant="h3" fontWeight="800" sx={{ color: '#fff', letterSpacing: -1 }}>Daily Filter</Typography>
                  <ExploreRoundedIcon sx={{ fontSize: 32, color: '#4a90e2', opacity: 0.95 }} />
                </Box>

                <Box sx={{ position: 'relative', mb: 6 }}>
                  <Box sx={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: '3px', background: 'linear-gradient(to bottom, #4a90e2, transparent)', borderRadius: 2 }} />
                  <Typography variant="h6" sx={{ pl: 4, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.8, color: 'rgba(255,255,255,0.95)', fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                    Does what I'm doing today move me closer to that person in my vision, or further away?
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AffirmationVisualization;
