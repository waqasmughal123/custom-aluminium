// 'use client';

// import React from 'react';
// import { Box, Button as MuiButton, Stack, Typography, Paper } from '@mui/material';
// import { Loader } from './Loader';
// import { useLoader } from '../../../viewmodels/hooks';

// export const LoaderExample: React.FC = () => {
//   const { isLoading, message, showLoader, hideLoader, setLoaderMessage } = useLoader();

//   const handleShowCircular = () => {
//     showLoader('Processing your request...');
//     setTimeout(hideLoader, 3000); // Auto-hide after 3 seconds for demo
//   };

//   const handleShowBrand = () => {
//     showLoader('Loading Custom Aluminium...');
//     setTimeout(hideLoader, 3000);
//   };

//   const handleShowMinimal = () => {
//     showLoader('Please wait...');
//     setTimeout(hideLoader, 2000);
//   };

//   const handleShowSteps = () => {
//     showLoader('Initializing...');
//     setTimeout(() => setLoaderMessage('Processing data...'), 1000);
//     setTimeout(() => setLoaderMessage('Almost done...'), 2000);
//     setTimeout(hideLoader, 3000);
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         Premium Loader Examples
//       </Typography>
      
//       <Paper sx={{ p: 3, mb: 3 }}>
//         <Typography variant="h6" gutterBottom>
//           Usage Examples
//         </Typography>
        
//         <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
//           <MuiButton 
//             variant="contained" 
//             onClick={handleShowCircular}
//             disabled={isLoading}
//           >
//             Show Circular Loader
//           </MuiButton>
          
//           <MuiButton 
//             variant="contained" 
//             color="secondary"
//             onClick={handleShowBrand}
//             disabled={isLoading}
//           >
//             Show Brand Loader
//           </MuiButton>
          
//           <MuiButton 
//             variant="outlined"
//             onClick={handleShowMinimal}
//             disabled={isLoading}
//           >
//             Show Minimal Loader
//           </MuiButton>
          
//           <MuiButton 
//             variant="outlined"
//             color="secondary"
//             onClick={handleShowSteps}
//             disabled={isLoading}
//           >
//             Show Progressive Steps
//           </MuiButton>
//         </Stack>
//       </Paper>

//       <Paper sx={{ p: 3 }}>
//         <Typography variant="h6" gutterBottom>
//           Code Examples
//         </Typography>
        
//         <Box component="pre" sx={{ 
//           backgroundColor: 'grey.100', 
//           p: 2, 
//           borderRadius: 1,
//           overflow: 'auto',
//           fontSize: '0.875rem'
//         }}>
// {`// 1. Import the components
// import { Loader } from '../views/components/common';
// import { useLoader } from '../viewmodels/hooks';

// // 2. Use the hook
// const { isLoading, showLoader, hideLoader } = useLoader();

// // 3. Show/hide loader
// const handleSubmit = async () => {
//   showLoader('Saving data...');
//   try {
//     await saveData();
//   } finally {
//     hideLoader();
//   }
// };

// // 4. Render the loader
// <Loader 
//   open={isLoading} 
//   variant="brand" 
//   size="medium"
//   message="Processing..."
// />`}
//         </Box>
//       </Paper>

//       {/* The actual loader */}
//       <Loader 
//         open={isLoading} 
//         variant="brand" 
//         size="medium"
//         message={message}
//       />
//     </Box>
//   );
// }; 