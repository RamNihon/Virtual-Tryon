import { precacheAndRoute } from 'workbox-precaching';

// Yeh lines website ki files ko background me cache/save karengi
precacheAndRoute(self.__WB_MANIFEST || []);
