import{u as r,U as e}from"./index.30dQFFTZ.js";function useCurrentUser({rejectOnEmpty:u=!0}={}){const{auth:s}=r();return u&&e(s.user,"user required"),s.user||void 0}export{useCurrentUser as u};
