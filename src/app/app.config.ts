import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"danotelist","appId":"1:348671274069:web:477c62cbca2b1f2f6538dc","storageBucket":"danotelist.appspot.com","apiKey":"AIzaSyDy4T1bFCN94Qtnm2dHcO80R1D3KKX3I-U","authDomain":"danotelist.firebaseapp.com","messagingSenderId":"348671274069"})), provideFirestore(() => getFirestore())]
};
