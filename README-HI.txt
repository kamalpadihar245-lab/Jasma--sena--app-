श्री राष्ट्रीय जसमा सेना परिवार मध्य प्रदेश — Firebase Config जोड़ा हुआ ऐप पैकेज

Firebase Web App config इस पैकेज की firebase-config.js फाइल में जोड़ दिया गया है। Project ID: jasma-sena-125. मुख्य एडमिन ईमेल: Kamalpadihar245@gmail.com.

महत्वपूर्ण: Config जोड़ना अकेले ऐप को लाइव या पूरी तरह चालू नहीं करता। Firebase Authentication में Email/Password चालू करें और मुख्य एडमिन उपयोगकर्ता बनाएँ। Firestore Database बनाएँ और इस पैकेज की firestore.rules प्रकाशित करें। Storage इस्तेमाल करने से पहले storage.rules की समीक्षा और परीक्षण करें। Hosting deploy और वास्तविक मोबाइल परीक्षण अभी अलग से करना होगा।

इस ऐप में आवेदन pending स्थिति में सहेजने, एडमिन द्वारा जाँच/मंजूरी, सदस्य रिकॉर्ड और ID सत्यापन का शुरुआती ढाँचा है।

सुरक्षा: वास्तविक सदस्य डेटा तभी लें जब Hosting URL, आवेदन सबमिशन, Admin login, approval और QR/ID verification का पूरा परीक्षण सफल हो। OTP, पासवर्ड या Service Account private key किसी से साझा न करें।
