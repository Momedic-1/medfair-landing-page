import { Fade, Menu, MenuItem } from '@mui/material';
import React from 'react'

const ConfirmationMenu = ({anchorEl, handleClose, open, handleDelete}) => {
     
  return (
    <div>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        sx={{
          '& .MuiPaper-root': {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
          },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
        <MenuItem onClick={handleClose}>Cancel</MenuItem>
        
      </Menu>
    </div>
  );
}

export default ConfirmationMenu