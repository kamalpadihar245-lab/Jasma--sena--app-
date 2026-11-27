जसमा सेना ऐप — GitHub/Firebase Hosting पैकेज
================================================
Firebase Project ID: jasma-sena-125
मुख्य एडमिन ईमेल: Kamalpadihar245@gmail.com
प्रदेश अध्यक्ष एडमिन ईमेल: shrirashtriyajasmasenapariwar@gmail.com

इस पैकेज में वेबसाइट, सदस्य आवेदन, एडमिन लॉगिन, सदस्य अनुमोदन,
डिजिटल आईडी प्रिंट और QR/आईडी सत्यापन का शुरुआती कार्यशील ढाँचा है।

अपलोड से पहले जरूरी सेटअप
-------------------------
1. Firebase Console खोलें: https://console.firebase.google.com/
2. प्रोजेक्ट jasma-sena-125 चुनें। Authentication > Sign-in method में
   Email/Password सक्षम करें।
3. Authentication > Users में मुख्य एडमिन के ईमेल
   Kamalpadihar245@gmail.com के लिए उपयोगकर्ता बनाएँ और सुरक्षित पासवर्ड रखें।
   पासवर्ड इस पैकेज या किसी चैट में न भेजें।
4. Firestore Database बनाएँ (Production mode), फिर Rules टैब में
   इस पैकेज की firestore.rules सामग्री प्रकाशित करें।
5. Storage चालू करें और storage.rules सामग्री प्रकाशित करें। फोटो अपलोड
   सार्वजनिक रूप से सीमित है; लाइव करने से पहले Firebase App Check लगाएँ,
   quota/billing और abuse monitoring की जाँच करें।
6. GitHub repository में इस ZIP की सभी फाइलें (छिपी .firebaserc सहित)
   अपलोड करें। ध्यान दें: GitHub मोबाइल ऐप में hidden file न दिखे तो
   Firebase CLI के साथ प्रोजेक्ट लिंक करें या .firebaserc अलग से बनाएँ।
7. कंप्यूटर पर Firebase CLI से उसी फ़ोल्डर में चलाएँ:
      npm install -g firebase-tools
      firebase login
      firebase use jasma-sena-125
      firebase deploy
   यह Hosting के साथ Firestore/Storage Rules भी प्रकाशित करेगा।

एडमिन लॉगिन
------------
ऐप के एडमिन टैब में ऊपर दिए गए ईमेल और Firebase Authentication में बनाए
गए पासवर्ड से लॉगिन करें। मुख्य एडमिन आवेदन मंजूर कर सकता है। प्रदेश अध्यक्ष एडमिन अलग ईमेल से लॉगिन करके आवेदन और सक्रिय सदस्यों की सूची देख सकता है, लेकिन मंजूरी नहीं दे सकता।

महत्वपूर्ण परीक्षण
-----------------
- पहले स्वयं एक परीक्षण आवेदन जमा करें।
- एडमिन लॉगिन करके आवेदन मंजूर करें।
- बनी हुई JASMA-XXXXXXXX आईडी को Verify टैब में जाँचें।
- आईडी प्रिंट और QR कोड को मोबाइल से जाँचें।
- सब सही होने से पहले वास्तविक सदस्यों का संवेदनशील डेटा न लें।

ध्यान दें: ZIP तैयार होने का अर्थ ऐप इंटरनेट पर लाइव होना नहीं है। Firebase
सेवाएँ सक्षम करना, Rules प्रकाशित करना और Hosting deploy करना बाकी है।
Firebase Web API key ब्राउज़र ऐप में सार्वजनिक रहती है; सुरक्षा का आधार
Firestore/Storage Rules, Authentication और App Check हैं।


नई भूमिका व्यवस्था
-------------------
- मुख्य एडमिन: Kamalpadihar245@gmail.com — आवेदन मंजूरी, सदस्य आईडी बनाना और सभी एडमिन कार्य।
- प्रदेश अध्यक्ष एडमिन: shrirashtriyajasmasenapariwar@gmail.com — आवेदन/सदस्य सूची देखना; मंजूरी का अधिकार नहीं।
- दोनों ईमेल Firebase Authentication > Users में अलग-अलग उपयोगकर्ता के रूप में बनाए जाने चाहिए।
- दोनों उपयोगकर्ताओं के पासवर्ड अलग और निजी रखें। पासवर्ड चैट में साझा न करें।
- Firestore Rules और Storage Rules को Firebase Console में प्रकाशित करना आवश्यक है।
- यह पैकेज अपने-आप लाइव/डिप्लॉय नहीं होता। पहले परीक्षण करें और Firebase App Check तथा usage limits सेट करें।
