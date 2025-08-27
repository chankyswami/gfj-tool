// GemLoader.jsx
import React from 'react';
import { Box } from '@mui/material';
import DiamondIcon from '@mui/icons-material/Diamond';
import { motion } from 'framer-motion';

const colors = ['#ffdd55', '#fcc602', '#663399', '#4c257e'];

const bounceVariant = {
  initial: { y: 0, scale: 1 },
  animate: i => ({
    y: [0, -10, 0],          // bounce up and down
    scale: [1, 1.2, 1],
    transition: {
      delay: i * 0.2,         // stagger
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  })
};

const GemLoader = ({ size = 40 }) => (
  <Box
    component={motion.div}
    sx={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 2,
      height: size * 1.5
    }}
  >
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        custom={i}
        variants={bounceVariant}
        initial="initial"
        animate="animate"
      >
        <DiamondIcon
          sx={{
            fontSize: size,
            color: colors[i % colors.length],
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.2))'
          }}
        />
      </motion.div>
    ))}
  </Box>
);

export default GemLoader;
