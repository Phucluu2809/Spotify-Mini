require('dotenv').config();

const mongoose = require('mongoose');
const path = require('path');

const Song = require('../models/song.model');
const cloudinary = require('../config/cloudinary');

const songs = [
  // Sơn Tùng M-TP
  { title: 'Chúng Ta Của Tương Lai', artist: 'Sơn Tùng M-TP', album: 'Single', image: 'https://picsum.photos/seed/son-tung-1/500/500', file: 'son-tung-01.mp3' },
  { title: 'Muộn Rồi Mà Sao Còn', artist: 'Sơn Tùng M-TP', album: 'Single', image: 'https://picsum.photos/seed/son-tung-2/500/500', file: 'son-tung-02.mp3' },
  { title: 'Chạy Ngay Đi', artist: 'Sơn Tùng M-TP', album: 'Single', image: 'https://picsum.photos/seed/son-tung-3/500/500', file: 'son-tung-03.mp3' },
  { title: 'Nơi Này Có Anh', artist: 'Sơn Tùng M-TP', album: 'Single', image: 'https://picsum.photos/seed/son-tung-4/500/500', file: 'son-tung-04.mp3' },
  { title: 'Lạc Trôi', artist: 'Sơn Tùng M-TP', album: 'Single', image: 'https://picsum.photos/seed/son-tung-5/500/500', file: 'son-tung-05.mp3' },

  // MONO
  { title: 'Waiting For You', artist: 'MONO', album: '22', image: 'https://picsum.photos/seed/mono-1/500/500', file: 'mono-01.mp3' },
  { title: 'Em Là', artist: 'MONO', album: '22', image: 'https://picsum.photos/seed/mono-2/500/500', file: 'mono-02.mp3' },
  { title: 'Anh Không Thể', artist: 'MONO', album: '22', image: 'https://picsum.photos/seed/mono-3/500/500', file: 'mono-03.mp3' },
  { title: 'Quên Anh Đi', artist: 'MONO', album: 'Single', image: 'https://picsum.photos/seed/mono-4/500/500', file: 'mono-04.mp3' },
  { title: 'Open Your Eyes', artist: 'MONO', album: 'Single', image: 'https://picsum.photos/seed/mono-5/500/500', file: 'mono-05.mp3' },

  // HIEUTHUHAI
  { title: 'Không Thể Say', artist: 'HIEUTHUHAI', album: 'Single', image: 'https://picsum.photos/seed/hieuthuhai-1/500/500', file: 'hieuthuhai-01.mp3' },
  { title: 'Ngủ Một Mình', artist: 'HIEUTHUHAI', album: 'Single', image: 'https://picsum.photos/seed/hieuthuhai-2/500/500', file: 'hieuthuhai-02.mp3' },
  { title: 'Exit Sign', artist: 'HIEUTHUHAI', album: 'Single', image: 'https://picsum.photos/seed/hieuthuhai-3/500/500', file: 'hieuthuhai-03.mp3' },
  { title: 'Vệ Tinh', artist: 'HIEUTHUHAI', album: 'Single', image: 'https://picsum.photos/seed/hieuthuhai-4/500/500', file: 'hieuthuhai-04.mp3' },
  { title: 'Dynamic Duo', artist: 'HIEUTHUHAI', album: 'Single', image: 'https://picsum.photos/seed/hieuthuhai-5/500/500', file: 'hieuthuhai-05.mp3' },

  // tlinh
  { title: 'Nếu Lúc Đó', artist: 'tlinh', album: 'Single', image: 'https://picsum.photos/seed/tlinh-1/500/500', file: 'tlinh-01.mp3' },
  { title: 'Gái Độc Thân', artist: 'tlinh', album: 'Single', image: 'https://picsum.photos/seed/tlinh-2/500/500', file: 'tlinh-02.mp3' },
  { title: 'Thích Quá Rùi Nà', artist: 'tlinh', album: 'Single', image: 'https://picsum.photos/seed/tlinh-3/500/500', file: 'tlinh-03.mp3' },
  { title: 'Ghệ Iu Dấu Của Em Ơi', artist: 'tlinh', album: 'Single', image: 'https://picsum.photos/seed/tlinh-4/500/500', file: 'tlinh-04.mp3' },
  { title: 'Vaicaunoicokhiennguoithaydoi', artist: 'tlinh', album: 'Single', image: 'https://picsum.photos/seed/tlinh-5/500/500', file: 'tlinh-05.mp3' },

  // Đen
  { title: 'Mang Tiền Về Cho Mẹ', artist: 'Đen', album: 'Single', image: 'https://picsum.photos/seed/den-1/500/500', file: 'den-01.mp3' },
  { title: 'Đi Về Nhà', artist: 'Đen', album: 'Single', image: 'https://picsum.photos/seed/den-2/500/500', file: 'den-02.mp3' },
  { title: 'Lối Nhỏ', artist: 'Đen', album: 'Single', image: 'https://picsum.photos/seed/den-3/500/500', file: 'den-03.mp3' },
  { title: 'Hai Triệu Năm', artist: 'Đen', album: 'Single', image: 'https://picsum.photos/seed/den-4/500/500', file: 'den-04.mp3' },
  { title: 'Bài Này Chill Phết', artist: 'Đen', album: 'Single', image: 'https://picsum.photos/seed/den-5/500/500', file: 'den-05.mp3' },

  // Vũ.
  { title: 'Bước Qua Nhau', artist: 'Vũ.', album: 'Single', image: 'https://picsum.photos/seed/vu-1/500/500', file: 'vu-01.mp3' },
  { title: 'Lạ Lùng', artist: 'Vũ.', album: 'Single', image: 'https://picsum.photos/seed/vu-2/500/500', file: 'vu-02.mp3' },
  { title: 'Đông Kiếm Em', artist: 'Vũ.', album: 'Single', image: 'https://picsum.photos/seed/vu-3/500/500', file: 'vu-03.mp3' },
  { title: 'Mùa Hè Của Em', artist: 'Vũ.', album: 'Single', image: 'https://picsum.photos/seed/vu-4/500/500', file: 'vu-04.mp3' },
  { title: 'Chuyện Những Người Yêu Xa', artist: 'Vũ.', album: 'Single', image: 'https://picsum.photos/seed/vu-5/500/500', file: 'vu-05.mp3' },

  // Hoàng Dũng
  { title: 'Nàng Thơ', artist: 'Hoàng Dũng', album: 'Single', image: 'https://picsum.photos/seed/hoang-dung-1/500/500', file: 'hoang-dung-01.mp3' },
  { title: 'Đôi Lời', artist: 'Hoàng Dũng', album: 'Single', image: 'https://picsum.photos/seed/hoang-dung-2/500/500', file: 'hoang-dung-02.mp3' },
  { title: 'Chờ Anh Nhé', artist: 'Hoàng Dũng', album: 'Single', image: 'https://picsum.photos/seed/hoang-dung-3/500/500', file: 'hoang-dung-03.mp3' },
  { title: 'Yếu Đuối', artist: 'Hoàng Dũng', album: 'Single', image: 'https://picsum.photos/seed/hoang-dung-4/500/500', file: 'hoang-dung-04.mp3' },
  { title: 'Thói Quen', artist: 'Hoàng Dũng', album: 'Single', image: 'https://picsum.photos/seed/hoang-dung-5/500/500', file: 'hoang-dung-05.mp3' },

  // Mỹ Tâm
  { title: 'Đúng Cũng Thành Sai', artist: 'Mỹ Tâm', album: 'Single', image: 'https://picsum.photos/seed/my-tam-1/500/500', file: 'my-tam-01.mp3' },
  { title: 'Người Hãy Quên Em Đi', artist: 'Mỹ Tâm', album: 'Single', image: 'https://picsum.photos/seed/my-tam-2/500/500', file: 'my-tam-02.mp3' },
  { title: 'Đừng Hỏi Em', artist: 'Mỹ Tâm', album: 'Single', image: 'https://picsum.photos/seed/my-tam-3/500/500', file: 'my-tam-03.mp3' },
  { title: 'Ước Gì', artist: 'Mỹ Tâm', album: 'Single', image: 'https://picsum.photos/seed/my-tam-4/500/500', file: 'my-tam-04.mp3' },
  { title: 'Họa Mi Tóc Nâu', artist: 'Mỹ Tâm', album: 'Single', image: 'https://picsum.photos/seed/my-tam-5/500/500', file: 'my-tam-05.mp3' },

  // Soobin
  { title: 'Phía Sau Một Cô Gái', artist: 'Soobin', album: 'Single', image: 'https://picsum.photos/seed/soobin-1/500/500', file: 'soobin-01.mp3' },
  { title: 'BlackJack', artist: 'Soobin', album: 'Single', image: 'https://picsum.photos/seed/soobin-2/500/500', file: 'soobin-02.mp3' },
  { title: 'Tháng Năm', artist: 'Soobin', album: 'Single', image: 'https://picsum.photos/seed/soobin-3/500/500', file: 'soobin-03.mp3' },
  { title: 'Đi Để Trở Về', artist: 'Soobin', album: 'Single', image: 'https://picsum.photos/seed/soobin-4/500/500', file: 'soobin-04.mp3' },
  { title: 'Nếu Ngày Ấy', artist: 'Soobin', album: 'Single', image: 'https://picsum.photos/seed/soobin-5/500/500', file: 'soobin-05.mp3' },

  // Bích Phương
  { title: 'Bùa Yêu', artist: 'Bích Phương', album: 'Single', image: 'https://picsum.photos/seed/bich-phuong-1/500/500', file: 'bich-phuong-01.mp3' },
  { title: 'Đi Đu Đưa Đi', artist: 'Bích Phương', album: 'Single', image: 'https://picsum.photos/seed/bich-phuong-2/500/500', file: 'bich-phuong-02.mp3' },
  { title: 'Bao Giờ Lấy Chồng', artist: 'Bích Phương', album: 'Single', image: 'https://picsum.photos/seed/bich-phuong-3/500/500', file: 'bich-phuong-03.mp3' },
  { title: 'Gửi Anh Xa Nhớ', artist: 'Bích Phương', album: 'Single', image: 'https://picsum.photos/seed/bich-phuong-4/500/500', file: 'bich-phuong-04.mp3' },
  { title: 'Một Cú Lừa', artist: 'Bích Phương', album: 'Single', image: 'https://picsum.photos/seed/bich-phuong-5/500/500', file: 'bich-phuong-05.mp3' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    await Song.deleteMany();

    const finalSongs = [];

    for (const song of songs) {
      const filePath = path.join(
        __dirname,
        '../uploads',
        song.file
      );

      const uploaded = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video',
        folder: 'spotify-mini'
      });

      finalSongs.push({
        spotifyId: Date.now().toString(),
        title: song.title,
        artist: song.artist,
        album: song.album,
        image: song.image,
        audio: uploaded.secure_url,
        duration: 200000
      });

      console.log(`Uploaded: ${song.title}`);
    }

    await Song.insertMany(finalSongs);

    console.log('Seed success');
        process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

seed();