# cách hoạt động của em nó
- trong cái đống này đã chia thành 2 phần rồi là backend và fe
- trong cái backend hiện tại chỉ có đúng 2 chức năng là stream bên cloudinary với mongodb làm cái metadata
- ae có thể chỉnh=))))
- trong phần giao diện cái app/(tabs) cái nớ nó sẽ là cái tab chính giao diện(ae chạy app thử sẽ thấy nó có cái nút ở dưới như home, setting, album ứng với từng file
- các phần còn lại khá "ĐƠN GIẢN" vì tên từng thư mục đã nói quá rõ chức năng nó rồi,(chát di bi ti của) ae đọc qua code rồi prompt giao diện giúp t nha
- còn 2 vấn đề chính cần xử lý là stream nhạc khi out khỏi app(tất nhiên khi xóa app khỏi thư mục trên đth thì nhạc nó tắt cmn=))) với cái thứ 2 là t cần ae prompt lại giao diện theo từng role để có commit=))
- còn đâu phần backend hay cái khác có vấn đề thì ae để lại ở đây cho bạn sau đọc review
- cách chạy cho ae đỡ phải prompt: ae bật 2 cmd sau đó chạy riêng 2 cái, cái backend chạy node src/app.js cái fe chạy 


```
Backend (Node.js):

express
mongoose
cors
dotenv
multer
cloudinary
multer-storage-cloudinary
nodemon

Cài:

npm install express mongoose cors dotenv multer cloudinary multer-storage-cloudinary
npm install nodemon --save-dev

```

```

Frontend (React Native + Expo):

expo
react-native
expo-router
axios
expo-av
react-native-linear-gradient
@expo/vector-icons
react-native-safe-area-context
react-native-screens
react-native-gesture-handler
react-native-reanimated
lucide-react-native

Cài:

npm install axios react-native-linear-gradient lucide-react-native
npx expo install expo-av expo-router @expo/vector-icons react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated


```
