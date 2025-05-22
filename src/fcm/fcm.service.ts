// src/fcm/fcm.service.ts
import { Injectable } from '@nestjs/common';
import admin from '../firebase/firebase-admin';

@Injectable()
export class FcmService {
  async sendNotification(token: string, title: string, body: string) {
    const message = {
      notification: { title, body },
      token,
    };

    try {
      await admin.messaging().send(message);
      console.log(` FCM 전송 완료: ${title}`);
    } catch (error) {
      console.error(' FCM 전송 실패:', error);
    }
  }
}
