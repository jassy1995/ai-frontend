// import React, { createContext, useContext, useState } from 'react';
// import { AnimatePresence, motion } from 'motion/react';
// import { useTimeoutFn } from 'react-use';
// import Portal from '@/components/ui/Portal.jsx';
// import { TbCheck, TbExclamationCircle, TbExclamationMark, TbInfoCircle } from 'react-icons/tb';
// import { cn } from '@/lib/utils';

// const ToastContext = createContext({
//   success: () => {},
//   error: () => {},
//   warning: () => {},
//   info: () => {},
//   default: () => {},
// });

// const generateUEID = () => {
//   let first = (Math.random() * 46656) | 0;
//   let second = (Math.random() * 46656) | 0;
//   first = ('000' + first.toString(36)).slice(-3);
//   second = ('000' + second.toString(36)).slice(-3);
//   return first + second;
// };

// export const ToastProvider = ({ children }) => {
//   const [toasts, setToasts] = useState([]);

//   const open = ({ message, type = 'success', timeout = 5000 }) => {
//     setToasts((prev) => [{ id: generateUEID(), message, type, timeout }, ...prev]);
//   };

//   const close = (id) => {
//     setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
//   };

//   const success = (message, timeout = 5000) => {
//     open({ message, type: 'success', timeout });
//   };

//   const error = (message, timeout = 5000) => {
//     open({ message, type: 'error', timeout });
//   };

//   const warning = (message, timeout = 5000) => {
//     open({ message, type: 'warning', timeout });
//   };

//   const info = (message, timeout = 5000) => {
//     open({ message, type: 'info', timeout });
//   };

//   const _default = (message, timeout = 5000) => {
//     open({ message, type: 'default', timeout });
//   };

//   const value = { success, error, warning, info, default: _default };

//   return (
//     <ToastContext.Provider value={value}>
//       {children}
//       <Portal selector="body">
//         <div
//           className={cn(
//             'fixed bottom-0 left-1/2 z-[999] w-full -translate-x-1/2 transform space-y-3 p-4 md:w-max md:max-w-md md:p-8',
//             {
//               'pointer-events-none': !toasts.length,
//             }
//           )}
//         >
//           <AnimatePresence>
//             {toasts.reverse().map((toast) => (
//               <Toast key={toast.id} onClose={() => close(toast.id)} toast={toast} />
//             ))}
//           </AnimatePresence>
//         </div>
//       </Portal>
//     </ToastContext.Provider>
//   );
// };

// export const useToast = () => useContext(ToastContext);

// const Toast = ({ toast, onClose }) => {
//   useTimeoutFn(onClose, toast.timeout);

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 30, scale: 0.3 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       exit={{ opacity: 0, y: 20, scale: 0.5 }}
//       transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
//       className={cn(
//         'z-[9999] flex w-full items-start rounded-xl px-4 py-3',
//         { 'bg-green-600 text-white': toast.type === 'success' },
//         { 'bg-red-600 text-white': toast.type === 'error' },
//         { 'bg-orange-600 text-white': toast.type === 'warning' },
//         { 'bg-blue-600 text-white': toast.type === 'info' },
//         { 'bg-white text-gray-800 shadow': toast.type === 'default' }
//       )}
//     >
//       <div className="mr-3 mt-[2px]">
//         {toast.type === 'success' && <TbCheck size="20" />}
//         {toast.type === 'error' && <TbExclamationCircle size="20" />}
//         {toast.type === 'warning' && <TbExclamationMark size="20" />}
//         {toast.type === 'info' && <TbInfoCircle size="20" />}
//       </div>
//       <p className="leading-snug">{toast.message}</p>
//     </motion.div>
//   );
// };
